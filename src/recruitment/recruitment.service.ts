import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApplyToVacancyDto } from './dto/apply-to-vacancy.dto';
import { ERROR_MESSAGES } from 'src/constants/swagger-messages';
import { VacanciesRepository } from './vacancies.repository';
import { ApplicationsRepository } from './applications.repository';
import { UsersRepository } from '../users/users.repository';
import { MediaService } from '../media/media.service';
import { StorageService } from '../storage/storage.service';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException } from '@nestjs/common';
import { buildApplicationsWorkbook } from './applications-export.builder';

@Injectable()
export class RecruitmentService {
  constructor(
    private readonly vacanciesRepository: VacanciesRepository,
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly mediaService: MediaService,
    private readonly storageService: StorageService,
    private readonly jwtService: JwtService,
  ) {}

  async exportSharedApplications(token: string) {
    const payload = await this.verifyApplicationShare(token);
    const vacancy = await this.vacanciesRepository.findById(payload.vacancyId);
    if (!vacancy) throw new NotFoundException('Vacancy not found');

    const applications = await this.applicationsRepository.findByVacancy(
      payload.vacancyId,
      {},
    );
    return buildApplicationsWorkbook(
      vacancy,
      applications,
      (app) =>
        `${process.env.BACKEND_URL ?? ''}/recruitment/shared-applications/${token}/${app.id}/cv`,
    );
  }

  async createApplicationShare(vacancyId: string) {
    const vacancy = await this.vacanciesRepository.findById(vacancyId);
    if (!vacancy) throw new NotFoundException('Vacancy not found');
    const token = await this.jwtService.signAsync(
      { purpose: 'vacancy_applications_share', vacancyId },
      { expiresIn: '7d' },
    );
    return { token, expiresInDays: 7 };
  }

  async getSharedApplications(token: string) {
    const payload = await this.verifyApplicationShare(token);
    const vacancy = await this.vacanciesRepository.findById(payload.vacancyId);
    if (!vacancy) throw new NotFoundException('Vacancy not found');
    const applications = await this.applicationsRepository.findByVacancy(
      payload.vacancyId,
      {},
    );
    return {
      vacancy: { id: vacancy.id, title: vacancy.title },
      expiresAt: new Date(payload.exp * 1000).toISOString(),
      applications: applications.map((application) => ({
        id: application.id,
        status: application.status,
        created_at: application.created_at,
        extra_data: application.extra_data,
        user: application.user
          ? {
              id: application.user.id,
              name: application.user.name,
              username: application.user.username,
              email: application.user.email,
              phone: application.user.phone,
              faculty: application.user.faculty,
              university: application.user.university,
              academic_year: application.user.academic_year,
              major: application.user.major,
              bio: application.user.bio,
              has_cv: Boolean(application.user.cv_file_key),
            }
          : null,
      })),
    };
  }

  async getSharedApplicationCv(token: string, applicationId: string) {
    const payload = await this.verifyApplicationShare(token);
    const application =
      await this.applicationsRepository.findByIdWithUser(applicationId);
    if (!application || application.vacancy_id !== payload.vacancyId) {
      throw new NotFoundException('Application not found');
    }
    if (!application.user?.cv_file_key) {
      throw new NotFoundException('CV not found');
    }
    return this.storageService.getFile(application.user.cv_file_key);
  }

  private async verifyApplicationShare(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (
        payload.purpose !== 'vacancy_applications_share' ||
        !payload.vacancyId
      ) {
        throw new Error('Invalid share token');
      }
      return payload as { purpose: string; vacancyId: string; exp: number };
    } catch {
      throw new ForbiddenException(
        'This application share link is invalid or expired',
      );
    }
  }

  async getOpenVacancies(
    search?: string,
    category_id?: string,
    society?: string,
  ) {
    return this.vacanciesRepository.findOpen(search, category_id, society);
  }

  async getVacancyById(id: string) {
    const vacancy = await this.vacanciesRepository.findById(id);
    if (!vacancy) {
      throw new NotFoundException('Vacancy not found');
    }
    return vacancy;
  }

  async applyToVacancy(
    userId: string,
    vacancyId: string,
    dto: ApplyToVacancyDto,
  ) {
    const user = await this.usersRepository.findById(userId);
    if (!user?.cv_file_key) {
      throw new BadRequestException(
        'You must upload your CV in your profile before applying.',
      );
    }

    const vacancy = await this.vacanciesRepository.findById(vacancyId);
    if (!vacancy) {
      throw new NotFoundException(ERROR_MESSAGES.VACANCY_NOT_FOUND);
    }

    if (!vacancy.is_open) {
      throw new BadRequestException(ERROR_MESSAGES.VACANCY_CLOSED);
    }

    const existingApplication =
      await this.applicationsRepository.findByUserAndVacancy(userId, vacancyId);

    if (existingApplication) {
      throw new BadRequestException(ERROR_MESSAGES.ALREADY_APPLIED);
    }

    if (vacancy.questions && vacancy.questions.length > 0) {
      const extraData = dto.extra_data || {};
      for (const question of vacancy.questions) {
        if (
          question.is_required &&
          !extraData[question.question_text] &&
          !extraData[question.id]
        ) {
          throw new BadRequestException(
            `Missing required answer for question: ${question.question_text}`,
          );
        }
      }
    }

    const application = this.applicationsRepository.create({
      user_id: userId,
      vacancy_id: vacancyId,
      extra_data: dto.extra_data,
    });

    return this.applicationsRepository.save(application);
  }

  async getMyApplications(userId: string) {
    return this.applicationsRepository.findByUser(userId);
  }

  async revokeApplication(userId: string, applicationId: string) {
    const application = await this.applicationsRepository.findByIdForUser(
      applicationId,
      userId,
    );

    if (!application) {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }

    await this.applicationsRepository.remove(application);
    return { success: true };
  }

  async uploadApplicationFile(file: any) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const fileBuffer = file.buffer || file.stream || file.data;
    if (!fileBuffer) {
      throw new BadRequestException('Invalid file format');
    }

    const uploadResponse = await this.storageService.uploadFile({
      fileName: file.originalname || 'application_file.pdf',
      fileBuffer: fileBuffer,
      contentType: file.mimetype || 'application/pdf',
      prefix: 'applications/',
      metadata: {
        uploadType: 'application',
        uploadedAt: new Date().toISOString(),
      },
    });

    return {
      url: uploadResponse.fileUrl,
      public_id: uploadResponse.fileKey,
    };
  }
}

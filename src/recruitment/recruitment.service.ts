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

@Injectable()
export class RecruitmentService {
  constructor(
    private readonly vacanciesRepository: VacanciesRepository,
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly mediaService: MediaService,
    private readonly storageService: StorageService,
  ) {}

  async getOpenVacancies(search?: string, category_id?: string) {
    return this.vacanciesRepository.findOpen(search, category_id);
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
      throw new BadRequestException('You must upload your CV in your profile before applying.');
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
        if (question.is_required && !extraData[question.question_text] && !extraData[question.id]) {
          throw new BadRequestException(`Missing required answer for question: ${question.question_text}`);
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

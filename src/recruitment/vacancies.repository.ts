import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Vacancy } from './entities/vacancy.entity';
import { VacanciesQueryDto } from 'src/admin/recruitment/dto/vacancies-query.dto';
import { paginate, PaginatedResult } from 'src/common/utils/pagination.util';

@Injectable()
export class VacanciesRepository {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacanciesRepository: Repository<Vacancy>,
  ) {}

  /** Admin view: every vacancy, open or closed. */
  async findAllPaginated(
    query: VacanciesQueryDto,
  ): Promise<PaginatedResult<Vacancy>> {
    const qb = this.vacanciesRepository
      .createQueryBuilder('vacancy')
      .leftJoinAndSelect('vacancy.category', 'category')
      .leftJoinAndSelect('vacancy.questions', 'question')
      .orderBy('vacancy.created_at', 'DESC')
      .addOrderBy('vacancy.id', 'DESC');

    this.applySearch(qb, query.search);
    this.applyCategory(qb, (query as any).category_id);

    return paginate(qb, query);
  }

  /** Public view: open vacancies only. */
  async findOpen(search?: string, category_id?: string): Promise<Vacancy[]> {
    const qb = this.vacanciesRepository
      .createQueryBuilder('vacancy')
      .leftJoinAndSelect('vacancy.category', 'category')
      .leftJoinAndSelect('vacancy.questions', 'question')
      .where('vacancy.is_open = :isOpen', { isOpen: true })
      .orderBy('vacancy.created_at', 'DESC');

    this.applySearch(qb, search);
    this.applyCategory(qb, category_id);

    return qb.getMany();
  }

  private applySearch(
    qb: ReturnType<Repository<Vacancy>['createQueryBuilder']>,
    search?: string,
  ): void {
    const term = search?.trim();
    if (term) {
      qb.andWhere(
        '(vacancy.title ILIKE :search OR vacancy.description ILIKE :search)',
        { search: `%${term}%` },
      );
    }
  }

  private applyCategory(
    qb: ReturnType<Repository<Vacancy>['createQueryBuilder']>,
    category_id?: string,
  ): void {
    if (category_id) {
      qb.andWhere('vacancy.category_id = :category_id', { category_id });
    }
  }

  async findById(id: string): Promise<Vacancy | null> {
    return this.vacanciesRepository.findOne({ 
      where: { id },
      relations: ['category', 'questions']
    });
  }

  create(data: DeepPartial<Vacancy>): Vacancy {
    return this.vacanciesRepository.create(data);
  }

  async preload(data: DeepPartial<Vacancy>): Promise<Vacancy | undefined> {
    return this.vacanciesRepository.preload(data);
  }

  async save(vacancy: Vacancy): Promise<Vacancy> {
    return this.vacanciesRepository.save(vacancy);
  }

  async remove(vacancy: Vacancy): Promise<Vacancy> {
    return this.vacanciesRepository.remove(vacancy);
  }
}

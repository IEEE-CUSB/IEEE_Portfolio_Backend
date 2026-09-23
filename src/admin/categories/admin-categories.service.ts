import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesRepository } from 'src/categories/categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ERROR_MESSAGES } from 'src/constants/swagger-messages';
import { InjectRepository } from '@nestjs/typeorm';
import { Category, CategoryType } from 'src/categories/entities/category.entity';
import { Repository } from 'typeorm';
import { Event } from 'src/events/entities/event.entity';
import { Workshop } from 'src/workshops/entities/workshop.entity';
import { Vacancy } from 'src/recruitment/entities/vacancy.entity';
import { Committee } from 'src/committees/entities/committee.entity';

@Injectable()
export class AdminCategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Workshop)
    private readonly workshopRepo: Repository<Workshop>,
    @InjectRepository(Vacancy)
    private readonly vacancyRepo: Repository<Vacancy>,
    @InjectRepository(Committee)
    private readonly committeeRepo: Repository<Committee>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Check for duplicate name + type
    await this.assertNameIsFree(createCategoryDto.name, createCategoryDto.type);

    const category = this.categoriesRepository.create(createCategoryDto);
    return await this.categoriesRepository.save(category);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    // Check for duplicate name if name is being updated
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      await this.assertNameIsFree(updateCategoryDto.name, category.type);
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoriesRepository.save(category);
  }

  async getUsage(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    let usageCount = 0;
    if (category.type === CategoryType.EVENT) {
      usageCount = await this.eventRepo.count({ where: { category_id: id } as any });
    } else if (category.type === CategoryType.WORKSHOP) {
      usageCount = await this.workshopRepo.count({ where: { category_id: id } as any });
    } else if (category.type === CategoryType.RECRUITMENT) {
      usageCount = await this.vacancyRepo.count({ where: { category_id: id } as any });
    } else if (category.type === CategoryType.COMMITTEE) {
      usageCount = await this.committeeRepo.count({ where: { category: { id } } as any });
    }

    return { usageCount };
  }

  async remove(id: string) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
    }

    // For committees, we don't reassign to "Other". We just delete if not in use.
    if (category.type === CategoryType.COMMITTEE) {
      const usageCount = await this.committeeRepo.count({ where: { category: { id } } as any });
      if (usageCount > 0) {
        throw new ConflictException('Cannot delete category: It is currently used by one or more committees.');
      }
      await this.categoriesRepository.remove(category);
      return { message: 'Category deleted successfully' };
    }

    // For other types, find or create "Other" category for this type
    let otherCategory = await this.categoriesRepository.findByNameAndType('Other', category.type);
    if (!otherCategory) {
      otherCategory = this.categoriesRepository.create({
        name: 'Other',
        type: category.type,
        description: 'Default category for reassigned items',
      });
      otherCategory = await this.categoriesRepository.save(otherCategory);
    }

    // Reassign items
    if (category.id !== otherCategory.id) {
      if (category.type === CategoryType.EVENT) {
        await this.eventRepo.update({ category_id: category.id } as any, { category_id: otherCategory.id } as any);
      } else if (category.type === CategoryType.WORKSHOP) {
        await this.workshopRepo.update({ category_id: category.id } as any, { category_id: otherCategory.id } as any);
      } else if (category.type === CategoryType.RECRUITMENT) {
        await this.vacancyRepo.update({ category_id: category.id } as any, { category_id: otherCategory.id } as any);
      }
    }

    // Remove the category (unless it is the Other category itself)
    if (category.id !== otherCategory.id) {
      await this.categoriesRepository.remove(category);
    }

    return {
      message: 'Category deleted and items reassigned successfully',
    };
  }

  private async assertNameIsFree(name: string, type: string) {
    const existing = await this.categoriesRepository.findByNameAndType(name, type);

    if (existing) {
      throw new ConflictException(ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);
    }
  }
}

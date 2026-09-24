import { Global, Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { StorageModule } from '../storage/storage.module';

@Global()
@Module({
  imports: [StorageModule],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}

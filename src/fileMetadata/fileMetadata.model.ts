import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { ProductImages } from "../product/product.model";


export enum FileProcessingStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

@Entity()
@Unique(["fileName"]) // Ensure fileName is unique in FileMetadata
export class FileMetadata {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  fileName: string; // Unique file name for each file metadata entry

  @Column({
    default: 0,
  })
  totalImages?: number;

  @Column({
    default: FileProcessingStatus.PENDING,
  })
  status?: FileProcessingStatus;

  @OneToMany(() => ProductImages, (productImage) => productImage.fileMetadata)
  images: ProductImages[]; // One-to-many relationship with ProductImages
}

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FileMetadata } from "../fileMetadata/fileMetadata.model";

export enum ImageProcessingStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

@Entity()
export class ProductImages {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  slNo: string;

  @Column()
  sku: string;

  @Column()
  rawImageUrl: string;

  @Column()
  rawImageSize: number;

  @Column({
    nullable: true,
  })
  processedImageUrl?: string;

  @Column({
    nullable: true,
  })
  processedImageSize?: number;

  @Column({
    type: "enum",
    enum: ImageProcessingStatus,
    default: ImageProcessingStatus.PENDING,
  })
  status?: ImageProcessingStatus;

  @ManyToOne(() => FileMetadata, (fileMetadata) => fileMetadata.images)
  fileMetadata: FileMetadata;
}

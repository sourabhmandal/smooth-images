import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ProductImages {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  slNo: string;

  @Column()
  sku: string;

  @Column()
  imageUrl: string;
}

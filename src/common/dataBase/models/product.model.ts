import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'products',
  timestamps: true,
})
export class Product extends Model<Product> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.STRING)
  declare slug: string;

  @Column(DataType.FLOAT)
  declare price: number;

  @Column(DataType.STRING)
  declare image: string;

  @Column(DataType.TEXT)
  declare description: string;

  @Column(DataType.INTEGER)
  declare stock: number;
}

import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Users } from './users.models';
import { Product } from './product.model';

@Table({
  tableName: 'orders',
  timestamps: true,
})
export class Order extends Model<Order> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Users)
  @Column(DataType.INTEGER)
  declare userId: number;

  @BelongsTo(() => Users)
  declare user: Users;

  @ForeignKey(() => Product)
  @Column(DataType.INTEGER)
  declare productId: number;

  @BelongsTo(() => Product)
  declare product: Product;

  @Column(DataType.INTEGER)
  declare quantity: number;

  @Column(DataType.FLOAT)
  declare totalAmount: number;

  @Column({
    type: DataType.STRING,
    defaultValue: 'pending',
  })
  declare status: string;
}

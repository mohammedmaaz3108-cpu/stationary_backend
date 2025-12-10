import { connectDatabase } from 'src/utils/databaseUtil';
import { Sample } from './models/samples.models';
import { Platform } from './models/platform.model';
import { Family } from './models/family.models';
import { LoginRequests } from './models/loginRequests.model';
import { Login } from './models/logins.models';
import { Users } from './models/users.models';
import { LoginRecords } from './models/loginRecords.models';
import { ActivityLogs } from './models/activity-logs.models';
import { Product } from './models/product.model';
import { Order } from './models/order.models';

export default async function initModels(config: {
  dialect: string;
  host: string;
  port: string | number;
  database: string;
  username: string;
  password: string;
}) {
  const sequelize = connectDatabase({
    dialect: config.dialect,
    host: config.host,
    port: Number(config.port),
    database: config.database,
    username: config.username,
    password: config.password,
  });
  sequelize.addModels([
    Sample,
    Platform,
    Family,
    LoginRequests,
    Login,
    Users,
    LoginRecords,
    ActivityLogs,
    Product,
    Order,
  ]);
  const influencer: any = {};
  influencer.sequelize = sequelize;
  influencer.Sample = Sample;
  influencer.Platforms = Platform;

  influencer.Family = Family;
  influencer.LoginRequests = LoginRequests;
  influencer.Logins = Login;
  influencer.LoginRecords = LoginRecords;
  influencer.Users = Users;
  influencer.ActivityLogs = ActivityLogs;
  influencer.Products = Product;
  influencer.Orders = Order;

  return influencer;
}

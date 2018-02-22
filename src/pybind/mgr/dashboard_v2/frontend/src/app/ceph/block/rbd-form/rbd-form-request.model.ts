export class RbdFormRequestModel {
  pool_name: string;
  image_name: string;
  size: number;
  obj_size: number;
  features: Array<string> = [];
  stripe_unit: number;
  stripe_count: number;
  data_pool: string;
}

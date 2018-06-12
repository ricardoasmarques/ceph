export class UserFormRoleModel {
  name: string;
  description: string;
  selected = false;

  constructor(name, description) {
    this.name = name;
    this.description = description;
  }
}

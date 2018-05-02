export type PermissionType = 'create' | 'read' | 'update' | 'delete';

export interface Permission {
  scope: string;
  showIf?: PermissionType | Array<PermissionType>;
  showIfSome?: Array<PermissionType>;
  showIfNot?: PermissionType | Array<PermissionType>;
}

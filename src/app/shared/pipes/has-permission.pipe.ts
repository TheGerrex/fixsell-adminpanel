// has-permission.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';

@Pipe({
  name: 'hasPermission',
  pure: false, // Set to false to re-evaluate when permissions change
})
export class HasPermissionPipe implements PipeTransform {
  constructor(private authService: AuthService) {}

  transform(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }
}

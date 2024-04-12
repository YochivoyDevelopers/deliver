import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private authServ: ApiService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): any {
        return this.authServ.checkAuth().then(user => {
            if (user) {
                return true;
            } else {
                this.router.navigate(['login']);
            }
        });
    }
}

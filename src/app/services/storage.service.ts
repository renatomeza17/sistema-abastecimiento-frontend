import { Injectable, Inject, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserSesion } from '../models/user-sesion';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }
  sessionService = inject(SessionService);

  getItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    }
    return null;
  }

    setItem(key: string, value: string): void {
      console.log('[StorageService] setItem', key, isPlatformBrowser(this.platformId));
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(key, value);
      }
    }

  setCookie(name: string, value: string, expiresAt?: Date): void {
    if (isPlatformBrowser(this.platformId)) {
      let expires = "";
      if (expiresAt) {
        expires = "; expires=" + expiresAt.toUTCString();
      }

      const isSecure = window.location.protocol === 'https:';
      const secureFlag = isSecure ? "; Secure" : "";
      const sameSiteFlag = "; SameSite=Lax";

      document.cookie = name + "=" + (value || "") + expires + "; path=/" + sameSiteFlag + secureFlag;
    }
  }

  private getExpirationFromToken(token: string): Date | null {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      if (payload.exp) {
        return new Date(payload.exp * 1000);
      }
    } catch (e) {
      console.error("Error decoding token expiration", e);
    }
    return null;
  }

  getCookie(name: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  }

  removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }

  removeCookie(name: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const isSecure = window.location.protocol === 'https:';
      const secureFlag = isSecure ? "; Secure" : "";
      document.cookie = name + '=; Max-Age=-99999999; path=/; SameSite=Lax' + secureFlag;
    }
  }

  clear(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      this.removeCookie("refresh_token");
    }
  }

  verificarSession(): boolean | undefined {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem("user_token");
    }
    return undefined;
  }

  getToken(): string | null {
    return this.getItem("user_token");
  }

  getRefreshToken(): string | null {
    return this.getItem("refresh_token") || this.getCookie("refresh_token");
  }

  getUserSession(): UserSesion | null  {
    return this.sessionService.getInfoSession();
  }

  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    const expiration = this.getExpirationFromToken(token);
    if (!expiration) return true;
    return expiration.getTime() < (Date.now() + 10000);
  }

  updateSession(token: string, refreshToken?: string): void {
    this.setItem("user_token", token);
    if (refreshToken) {
      this.setItem("refresh_token", refreshToken);
      const expirationDate = this.getExpirationFromToken(refreshToken);
      this.setCookie("refresh_token", refreshToken, expirationDate || undefined);
    }
  }

  deleteSession(): void {
    this.removeItem("user_token");
    this.removeItem("refresh_token");
    this.removeCookie("refresh_token");
  }
}

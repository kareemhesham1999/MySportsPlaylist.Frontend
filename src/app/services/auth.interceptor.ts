import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');

  // If token exists, add it to the Authorization header
  if (token) {
    const modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(modifiedReq);
  }

  // If no token, proceed with original request
  return next(req);
};

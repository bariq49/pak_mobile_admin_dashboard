// src/api/auth.api.ts
import http from "@/utils/http";
import { API_RESOURCES } from "@/utils/api-endpoints";
import type { LoginFormValues } from "@/schemas/login-schema";

export interface LoginResponse {
  token: string;
  user?: any;
  data?: any;
  message?: string;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  completeAddress?: string;
  avatar?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: any;
  };
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}


/* ============ AUTH APIs ============ */

// Login API
export async function loginApi(input: LoginFormValues): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>(API_RESOURCES.LOGIN, input);
  return data;
}

// Get current user
export async function getCurrentUserApi() {
  const { data } = await http.get(API_RESOURCES.USER);
  return data?.data.user;
}

// Logout user
export async function logoutApi() {
  const { data } = await http.get(API_RESOURCES.LOGOUT);
  return data?.data;
}

export async function updateProfileApi(
  input: Record<string, any>
): Promise<UpdateProfileResponse> {
  const formData = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  for (const [key, value] of formData.entries()) {
    console.log("FormData:", key, value);
  }

  const { data } = await http.patch(API_RESOURCES.USER, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

// Change password
export async function changePasswordApi(
  input: ChangePasswordInput
): Promise<ChangePasswordResponse> {
  const { data } = await http.patch(API_RESOURCES.CHANGE_PASSWORD, input);
  return data;
}
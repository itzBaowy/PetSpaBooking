# Auth Login Flow

Tài liệu này mô tả luồng đăng nhập hiện tại của FE web: từ Axios client, interceptor refresh token, TanStack Query hooks, Zustand auth store, cho tới UI login và guard phân quyền.

## 1. Các file chính

```txt
constants/api-endpoints.ts
lib/axios.ts
stores/cookie-store.ts
stores/auth-store.ts
providers/auth-provider.tsx
apis/auth/queries.ts
apis/auth/schema.ts
apis/auth/components/login-form.tsx
components/guards/index.tsx
```

Vai trò từng file:

- `constants/api-endpoints.ts`: khai báo path API dùng chung.
- `lib/axios.ts`: tạo Axios instance duy nhất, tự gắn access token và refresh token khi gặp `401`.
- `stores/auth-store.ts`: lưu `accessToken` và `refreshToken`.
- `stores/cookie-store.ts`: adapter để Zustand persist token xuống cookie.
- `providers/auth-provider.tsx`: rehydrate auth store trước khi render app.
- `apis/auth/queries.ts`: chứa TanStack Query hooks cho login/register/profile.
- `apis/auth/schema.ts`: validate form đăng nhập bằng Zod.
- `apis/auth/components/login-form.tsx`: UI form đăng nhập và xử lý redirect theo role.
- `components/guards/index.tsx`: bảo vệ route dashboard theo token và role.

## 2. API endpoints đang dùng

Trong `constants/api-endpoints.ts`:

```ts
AUTH: {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  PROFILE: "/auth/get-info",
  REFRESH: "/auth/refresh-token",
}
```

Login flow dùng trực tiếp:

- `POST /auth/login`
- `GET /auth/get-info`
- `POST /auth/refresh-token`

## 3. Axios client và interceptor

File: `lib/axios.ts`

Axios instance được tạo một lần:

```ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
```

FE ưu tiên lấy backend URL từ `.env`:

```txt
NEXT_PUBLIC_API_URL=http://localhost:5500/api
```

Nếu không có env thì fallback về `http://localhost:5500/api`.

### Request interceptor

Trước mỗi request, Axios đọc `accessToken` từ Zustand store:

```ts
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Ý nghĩa:

- UI/query hook không cần tự gắn header.
- Mọi request qua `api` đều tự có `Authorization: Bearer <accessToken>` nếu user đã đăng nhập.

### Response interceptor và refresh token

Khi API trả `401`, interceptor sẽ:

1. Kiểm tra request chưa retry.
2. Bỏ qua nếu chính request đó là `/auth/refresh-token`.
3. Gọi refresh token.
4. Lưu token mới vào store.
5. Gửi lại request cũ với access token mới.
6. Nếu refresh fail thì clear token và reject lỗi.

`refreshPromise` được dùng để tránh nhiều request cùng lúc gọi refresh token trùng nhau:

```ts
let refreshPromise: Promise<AuthToken> | null = null;
```

Khi refresh thành công:

```ts
const nextTokens = response.data.data;
setTokens(nextTokens);
return nextTokens;
```

Khi refresh thất bại hoặc API tiếp tục trả `401`:

```ts
useAuthStore.getState().clearTokens();
```

## 4. Auth store và cookie storage

File: `stores/auth-store.ts`

Store hiện tại chỉ giữ session token:

```ts
interface Auth {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (...) => void;
  clearTokens: () => void;
}
```

Store dùng Zustand `persist`:

```ts
persist(..., {
  name: "auth-storage",
  skipHydration: true,
  storage: createJSONStorage(() => createCookieStorage()),
})
```

Điểm quan trọng:

- Token được persist qua cookie thay vì localStorage.
- `skipHydration: true` nghĩa là app phải tự gọi rehydrate trước khi dùng token.

File `stores/cookie-store.ts` dùng `typescript-cookie`:

```ts
setCookie(name, value, {
  secure: shouldUseSecureCookie(),
  sameSite: "strict",
  path: "/",
});
```

Hiện tại cookie này là client-side cookie, không phải httpOnly cookie. Vì vậy FE đọc được token để tự gắn header.

## 5. AuthProvider rehydrate store

File: `providers/auth-provider.tsx`

`AuthProvider` gọi:

```ts
useAuthStore.persist.rehydrate();
```

Trong lúc store chưa rehydrate xong, provider return `null`.

Ý nghĩa:

- Tránh UI/guard đọc token quá sớm.
- Tránh trường hợp user đã có cookie nhưng app render nhầm trạng thái chưa đăng nhập.

## 6. Auth query hooks

File: `apis/auth/queries.ts`

### `useLogin`

```ts
export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      const response = await api.post<ApiResponse<LoginResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials,
      );
      return response.data.data;
    },
  });
}
```

`useLogin` chỉ gọi API và trả token. Nó không tự lưu token để component còn chủ động xử lý flow sau login.

### `useProfile`

```ts
export function useProfile() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery<User>({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<User>>(
        API_ENDPOINTS.AUTH.PROFILE,
      );
      return response.data.data;
    },
    enabled: Boolean(accessToken),
  });
}
```

Điểm quan trọng:

- Chỉ gọi `/auth/get-info` khi có `accessToken`.
- Query key dùng shared constants: `queryKeys.auth.me()`.
- Request tự có Authorization header nhờ Axios interceptor.

## 7. Login UI flow

File: `apis/auth/components/login-form.tsx`

Luồng submit:

1. User submit form.
2. Form lấy `userName` và `password`.
3. Validate bằng `loginSchema`.
4. Gọi `useLogin().mutateAsync`.
5. Lưu token bằng `setTokens(tokens)`.
6. Gọi `profileQuery.refetch()` để lấy role mới nhất từ `/auth/get-info`.
7. Điều hướng theo role.

Pseudo flow:

```txt
submit
→ validate zod
→ POST /auth/login
→ setTokens(accessToken, refreshToken)
→ GET /auth/get-info
→ check role
→ router.push(...)
```

Role redirect hiện tại:

```ts
const roleHomePath: Record<string, string> = {
  ADMIN: "/admin",
  PENDING_PROVIDER: "/provider-verification",
  PROVIDER: "/provider",
};
```

Nếu role là:

- `ADMIN`: vào `/admin`
- `PROVIDER`: vào `/provider`
- `PENDING_PROVIDER`: vào `/provider-verification`
- Role khác: chặn vào cổng web này, trừ khi đang đi vào flow đăng ký provider.

Nếu URL có query `next`, form ưu tiên redirect về `next`:

```txt
/login?next=/admin/verification
```

Sau login thành công, nếu role hợp lệ thì đi tới `next`.

## 8. Provider pending verification sau login

Sau khi đăng ký provider xong, FE chuyển user về:

```txt
/login?providerRegistered=1
```

Login form đọc query này để hiện thông báo đăng ký thành công và yêu cầu đăng nhập lại để xem hồ sơ đang chờ duyệt.

Nếu user đăng nhập với role `PENDING_PROVIDER`, user được đưa tới:

```txt
/provider-verification
```

Tại đó chỉ hiển thị hồ sơ chờ duyệt và nút đăng xuất, không vào dashboard provider.

## 9. Guards bảo vệ dashboard

File: `components/guards/index.tsx`

`AuthGuard` xử lý:

- Không có token → redirect về `/login?next=<current-path>`.
- Có lỗi profile → clear token và redirect về login.
- Có role nhưng không đúng allowed role → chuyển về home path tương ứng role.

Dashboard role map:

```ts
const routeRoleMap = {
  admin: "ADMIN",
  provider: "PROVIDER",
};
```

Vì vậy:

- `/admin/*` chỉ cho `ADMIN`.
- `/provider/*` chỉ cho `PROVIDER`.
- `PENDING_PROVIDER` không vào provider dashboard, chỉ được về `/provider-verification`.

## 10. Tổng kết data flow

```txt
LoginForm
  ↓
useLogin mutation
  ↓
api.post(API_ENDPOINTS.AUTH.LOGIN)
  ↓
Backend trả accessToken + refreshToken
  ↓
useAuthStore.setTokens()
  ↓
useProfile.refetch()
  ↓
api.get(API_ENDPOINTS.AUTH.PROFILE)
  ↓
Axios request interceptor gắn Bearer token
  ↓
Backend trả user info + role
  ↓
LoginForm redirect theo role
```

Khi token hết hạn:

```txt
Any API request
  ↓
Backend trả 401
  ↓
Axios response interceptor
  ↓
POST /auth/refresh-token
  ↓
setTokens(token mới)
  ↓
retry request cũ
```

## 11. Quy ước cần giữ khi sửa tiếp

- Không gọi Axios trực tiếp trong `page.tsx`.
- Không tạo Axios client mới.
- API request phải dùng `api` từ `lib/axios.ts`.
- Endpoint phải thêm ở `constants/api-endpoints.ts`.
- Query key phải thêm ở `constants/query-keys.ts`.
- Feature auth query/mutation để trong `apis/auth/queries.ts`.
- UI/form auth để trong `apis/auth/components`.
- Guard phân quyền để trong `components/guards`.
- Token/session state để trong `stores/auth-store.ts`.

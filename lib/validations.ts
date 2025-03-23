import { z } from "zod"

// 增强输入验证，添加更严格的模式匹配和长度限制
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少需要3个字符")
    .max(50, "用户名不能超过50个字符")
    .regex(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, "用户名只能包含字母、数字、中文、下划线和连字符"),
  email: z.string().email("请输入有效的邮箱地址").max(100, "邮箱地址过长"),
  password: z
    .string()
    .min(8, "密码至少需要8个字符")
    .max(100, "密码不能超过100个字符")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "密码必须包含至少一个大写字母、一个小写字母、一个数字和一个特殊字符",
    ),
  captchaToken: z.string(),
  captcha: z.string().min(1, "请输入验证码"),
})

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址").max(100, "邮箱地址过长"),
  password: z.string().min(1, "请输入密码"),
})

export const applicationSchema = z.object({
  institutionName: z
    .string()
    .min(1, "机构名称不能为空")
    .max(100, "机构名称不能超过100个字符")
    .regex(/^[a-zA-Z0-9\u4e00-\u9fa5_\-\s]+$/, "机构名称包含无效字符"),
  description: z.string().min(1, "机构描述不能为空").max(500, "机构描述不能超过500个字符"),
  website: z
    .string()
    .url("请输入有效的网站地址")
    .or(z.string().length(0))
    .optional()
    .transform((val) => (val === "" ? null : val)),
  contactEmail: z.string().email("请输入有效的邮箱地址").max(100, "邮箱地址过长"),
  contactPhone: z
    .string()
    .regex(/^\d{11}$/, "请输入有效的手机号码")
    .or(z.string().length(0))
    .optional()
    .transform((val) => (val === "" ? null : val)),
  foundingYear: z
    .string()
    .regex(/^\d{4}$/, "请输入有效的成立年份（四位数字）")
    .or(z.string().length(0))
    .optional()
    .transform((val) => (val === "" ? null : val)),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "请输入当前密码"),
    newPassword: z
      .string()
      .min(8, "新密码至少需要8个字符")
      .max(100, "密码不能超过100个字符")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "密码必须包含至少一个大写字母、一个小写字母、一个数字和一个特殊字符",
      ),
    confirmPassword: z.string().min(1, "请确认新密码"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  })


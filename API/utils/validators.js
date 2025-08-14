import yup from "yup";

export const registerInputSchema = yup.object({
  name: yup.string().required("Name is required."),
  email: yup
    .string()
    .email("You must enter a valid email.")
    .required("Email is required."),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .required("Password is required."),
  role: yup
    .string()
    .oneOf(["BUYER", "ARTISAN", "ADMIN"], "Invalid user role specified."),
  profileImage: yup.string().url("Profile image must be a valid URL."),
});

export const loginInputSchema = yup.object({
  email: yup
    .string()
    .email("You must enter a valid email.")
    .required("Email is required."),
  password: yup.string().required("Password is required."),
});

export const productInputSchema = yup.object({
  name: yup.string().required(),
  description: yup.string().required(),
  price: yup.number().required().positive(),
  quantity: yup.number().required().integer().min(0),
  categoryId: yup.string().required(),
  images: yup
    .array()
    .of(
      yup
        .string()
        .test(
          "is-url-or-relative",
          "Image must be a valid URL or relative path",
          (value) =>
            typeof value === "string" &&
            (/^https?:\/\//.test(value) || /^\/uploads\/.+/.test(value))
        )
    ),
});

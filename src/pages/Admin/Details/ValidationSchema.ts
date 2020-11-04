import { createUrlSafeName, VenueInput, PlacementInput } from "api/admin";
import firebase from "firebase/app";
import "firebase/functions";
import * as Yup from "yup";
import { VenueTemplate } from "types/VenueTemplate";
import {
  ZOOM_URL_TEMPLATES,
  IFRAME_TEMPLATES,
  BACKGROUND_IMG_TEMPLATES,
  PLAYA_VENUE_SIZE,
  MAX_IMAGE_FILE_SIZE_BYTES,
  GIF_RESIZER_URL,
  PLAYA_WIDTH,
  PLAYA_HEIGHT,
} from "settings";

const initialMapIconPlacement: VenueInput["placement"] = {
  x: (PLAYA_WIDTH - PLAYA_VENUE_SIZE) / 2,
  y: (PLAYA_HEIGHT - PLAYA_VENUE_SIZE) / 2,
};

type Question = VenueInput["profileQuestions"][number];

const createFileSchema = (name: string, required: boolean) =>
  Yup.mixed<FileList>()
    .test(
      name,
      "Image required",
      (val: FileList) => !required || val.length > 0
    )
    .test(
      name,
      `File size limit is 2mb. You can shrink images at ${GIF_RESIZER_URL}`,
      async (val?: FileList) => {
        if (!val || val.length === 0) return true;
        const file = val[0];
        return file.size <= MAX_IMAGE_FILE_SIZE_BYTES;
      }
    );

const urlIfNoFileValidation = (fieldName: string) =>
  Yup.string().when(
    fieldName,
    (file: FileList | undefined, schema: Yup.MixedSchema<FileList>) =>
      file && file.length > 0
        ? schema.notRequired()
        : schema.required("Required")
  );

export const validationSchema = Yup.object()
  .shape<VenueInput>({
    template: Yup.string(),
    name: Yup.string()
      .required("Name is required!")
      .min(3, ({ min }) => `Name must be at least ${min} characters`)
      .when(
        "$editing",
        (schema: Yup.StringSchema) => schema //will be set from the data from the api. Does not need to be unique
      ),
    bannerImageFile: createFileSchema("bannerImageFile", false),
      // .notRequired(), // override files to make them non required
    logoImageFile: createFileSchema("logoImageFile", false).notRequired(),

    mapIconImageFile: createFileSchema("mapIconImageFile", false).notRequired(),
    mapIconImageUrl: urlIfNoFileValidation("mapIconImageFile"),

    mapBackgroundImageFile: Yup.mixed<FileList>().when(
      "$template.template",
      (template: VenueTemplate, schema: Yup.MixedSchema<FileList>) =>
        BACKGROUND_IMG_TEMPLATES.includes(template)
          ? createFileSchema("mapBackgroundImageFile", false).notRequired()
          : schema.notRequired()
    ),

    mapBackgroundImageUrl: Yup.string().when(
      "$template.template",
      (template: VenueTemplate, schema: Yup.StringSchema) =>
        BACKGROUND_IMG_TEMPLATES.includes(template)
          ? urlIfNoFileValidation("mapBackgroundImageFile")
          : schema.notRequired()
    ),

    bannerImageUrl: urlIfNoFileValidation("bannerImageFile"),
    logoImageUrl: urlIfNoFileValidation("logoImageFile"),
    description: Yup.string().required("Description is required!"),
    subtitle: Yup.string().required("Subtitle is required!"),
    zoomUrl: Yup.string().when(
      "$template.template",
      (template: VenueTemplate, schema: Yup.MixedSchema<FileList>) =>
        ZOOM_URL_TEMPLATES.includes(template)
          ? schema
              .required("Required")
              .test("zoomUrl", "URL required", (val: string) => val.length > 0)
          : schema.notRequired()
    ),
    iframeUrl: Yup.string().when(
      "$template.template",
      (template: VenueTemplate, schema: Yup.MixedSchema<FileList>) =>
        IFRAME_TEMPLATES.includes(template)
          ? schema
              .required("Required")
              .test(
                "iframeUrl",
                "Video URL required",
                (val: string) => val.length > 0
              )
          : schema.notRequired()
    ),

    width: Yup.number().notRequired().min(0).max(PLAYA_WIDTH),
    height: Yup.number().notRequired().min(0).max(PLAYA_HEIGHT),

    placement: Yup.object()
      .shape({
        x: Yup.number().required("Required").min(0).max(PLAYA_WIDTH),
        y: Yup.number().required("Required").min(0).max(PLAYA_HEIGHT),
      })
      .default(initialMapIconPlacement),

    // @debt provide some validation error messages for invalid questions
    // advanced options
    profileQuestions: Yup.array<Question>()
      .ensure()
      .defined()
      .transform((val: Array<Question>) =>
        val.filter((s) => !!s.name && !!s.text)
      ), // ensure questions are not empty strings

    placementRequests: Yup.string().notRequired(),
    adultContent: Yup.bool().required(),
    bannerMessage: Yup.string().notRequired(),
    parentId: Yup.string().notRequired(),
  })
  .required();

// this is used to transform the api data to conform to the yup schema
export const editVenueCastSchema = Yup.object()
  .shape<Partial<VenueInput>>({})
  // possible locations for the subtitle
  .from("subtitle", "subtitle")
  .from("config.landingPageConfig.subtitle", "subtitle")

  .from("config.landingPageConfig.description", "description")
  .from("profile_questions", "profileQuestions")
  .from("host.icon", "logoImageUrl")
  .from("adultContent", "adultContent")

  // possible locations for the banner image
  .from("config.landingPageConfig.coverImageUrl", "bannerImageUrl")
  .from("config.landingPageConfig.bannerImageUrl", "bannerImageUrl")

  // possible locations for the map icon
  .from("config.mapIconImageUrl", "mapIconImageUrl")
  .from("mapIconImageUrl", "mapIconImageUrl");

export const editPlacementCastSchema = Yup.object()
  .shape<Partial<PlacementInput>>({})

  // possible locations for the map icon
  .from("config.mapIconImageUrl", "mapIconImageUrl")
  .from("mapIconImageUrl", "mapIconImageUrl")
  .from("placement.addressText", "addressText")
  .from("placement.notes", "notes")
  .required();

export const editPlacementSchema = Yup.object().shape<PlacementInput>({
  mapIconImageFile: createFileSchema("mapIconImageFile", false).notRequired(),
  mapIconImageUrl: urlIfNoFileValidation("mapIconImageFile"),
  addressText: Yup.string(),
  notes: Yup.string(),
  width: Yup.number().required("Required"),
  height: Yup.number().required("Required"),
  placement: Yup.object()
    .shape({
      x: Yup.number().required("Required").min(0).max(PLAYA_WIDTH),
      y: Yup.number().required("Required").min(0).max(PLAYA_HEIGHT),
    })
    .default(initialMapIconPlacement),
});
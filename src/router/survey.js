import Survey from "@/pages/survey/Survey.vue";

const surveyRoutes = [
  {
    path: "/survey",
    name: "Survey",
    component: Survey,
    meta: {
      hideGlobalPrompt: true,
    },
  },
];

export default surveyRoutes;

import HomePage from "../pages/HomePage.js";
import AddStoryPage from "../pages/AddStoryPage.js";
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import SavedStoriesPage from "../pages/SavedStoriesPage.js";
import NotFoundPage from "../pages/NotFoundPage.js";

const routes = {
  "/": HomePage,
  "/home": HomePage,
  "/add-story": AddStoryPage,
  "/login": LoginPage,
  "/register": RegisterPage,
  "/saved-stories": SavedStoriesPage,
  "*": NotFoundPage,
};

export default routes;

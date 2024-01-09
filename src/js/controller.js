import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();
    console.log('Recipe ID:', id);

    // 0) update results view to mark selected search result
    resultsView.update(model.getSearchResultPage());

    // 1 updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // Loading recipe
    await model.loadRecipe(id);
    const { recipe } = model.state;

    console.log('Recipe data:', recipe);

    // 2) rendering recipe

    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err, '📷📷📷📷');
  }
};

// controlRecipes();

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    console.log(resultsView);

    // 1- get search query
    const query = searchView.getQuery();
    if (!query) return;
    // 2- Load  search results
    await model.loadSearchResult(query);
    // 3- render results

    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultPage());

    // render initial pagination models
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
// controlSearchResults();

const controlPagination = function (goToPage) {
  // render the new results
  resultsView.render(model.getSearchResultPage(goToPage));
  // // render new paginationf button
  paginationView.render(model.state.search);
  // console.log(goToPage);
};

const controleServings = function (newServings) {
  // update the recipe servings ( in state)
  model.updateServings(newServings);

  // update the view ( recipe view )
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // Add /remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) update recipe view

  recipeView.update(model.state.recipe);

  // 3) render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controleBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // load spinner
    addRecipeView.renderSpinner();
    // upload new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Rendre recipe
    recipeView.render(model.state.recipe);
    // success message
    addRecipeView.renderMessage();
    // Render book mark view
    bookmarksView.render(model.state.bookmarks);

    // // change the Id in url

    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // going back  to the last page
    // window.history.back()

    // close form window

    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

// i TRYED PUBLISHER SUBSCRIBER PATTERN

const init = function () {
  bookmarksView.addHandlerRender(controleBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  // recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServing(controleServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

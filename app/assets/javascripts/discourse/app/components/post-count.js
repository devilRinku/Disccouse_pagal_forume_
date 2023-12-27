import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class postcount extends Component {
  @service ajax;

  // Use the @tracked decorator to make properties reactive
  @tracked totalCategories;
  @tracked totalTopics;
  @tracked totalPosts;
  @tracked categories;

  constructor() {
    super(...arguments);

    // Make the AJAX request in the constructor
    this.ajax.request('http://localhost:4200/post_count')
      .then((response) => {
        // Destructure the response and set properties
        const {
          total_categories: totalCategories,
          total_topics: totalTopics,
          total_posts: totalPosts,
          categories,
        } = response;

        this.totalCategories = totalCategories;
        this.totalTopics = totalTopics;
        this.totalPosts = totalPosts;
        this.categories = categories;

        // Log the response for verification
        console.log(response);
      })
      .catch((error) => {
        // Handle errors
        console.error(error);
      });
  }
}

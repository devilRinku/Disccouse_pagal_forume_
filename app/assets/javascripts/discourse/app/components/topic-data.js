// your-component.js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { longDate, relativeAge } from "discourse/lib/formatter";
import { helperContext } from "discourse-common/lib/helpers";




export default class TestComponent extends Component {
  @service currentUser;
  @tracked totalCategories;
  @tracked totalTopics;
  @tracked totalPosts;
  @tracked categories;
  @tracked lastVisitedPost;
  @tracked lastUpdateFormatted;
  @tracked lastUpdatePost;
  @tracked lastActivityPost;
  @tracked lastActivityTime;


  @alias('topics') filteredTopics;

  loadData = async () => {
    try {
      const response = await fetch('http://localhost:4200/post_count');
      const data = await response.json();
      let siteSettings = helperContext().siteSettings;
      console.log("hiiihiiihiihii", siteSettings);

      const {
        total_categories: totalCategories,
        total_topics: totalTopics,
        total_posts: totalPosts,
        categories,
        last_activity: lastActivity,
        last_created_post: lastCreatedPost,
      } = data;

      this.totalCategories = totalCategories;
      this.totalTopics = totalTopics;
      this.totalPosts = totalPosts;
      this.categories = categories;
      this.lastVisitedPost = lastCreatedPost; // Use last_created_post instead of last_visited_post
      this.lastActivityPost = lastActivity.last_activity_post;
      this.lastActivityTime = this.calculateRelativeTime(lastActivity.last_activity_date);

      if (categories.length > 0 && categories[0].last_updated_at) {
        this.lastUpdateFormatted = this.dateNode(categories[0].last_updated_at);
        this.lastUpdatePost = categories[0].last_post;

        if (this.lastUpdatePost) {
          if (this.lastUpdatePost.bumpedAt) {
            this.lastUpdatePostTime = this.dateNode(this.lastUpdatePost.bumpedAt);
          } else {
            console.log("Last Update Post is missing bumpedAt property");
          }
        } else {
          console.log("Last Update Post is undefined");
        }
      }

    } catch (error) {
      console.error(error);
    }
  }

  dateNode = (dt) => {
    if (typeof dt === "string") {
      dt = new Date(dt);
    }
    if (dt) {
      const attributes = {
        title: longDate(dt),
        "data-time": dt.getTime(),
        "data-format": "tiny",
      };
      const formattedDate = relativeAge(dt);
      console.log("console with", { attributes }, formattedDate);
      return formattedDate;
    }
  }

  calculateRelativeTime = (date) => {
    if (date) {
      const currentTime = new Date();
      const activityTime = new Date(date);
      const timeDiff = currentTime - activityTime;
      const seconds = Math.floor(timeDiff / 1000);

      if (seconds < 60) {
        return `${seconds} seconds ago`;
      }

      const minutes = Math.floor(seconds / 60);

      if (minutes < 60) {
        return `${minutes} minutes ago`;
      }

      const hours = Math.floor(minutes / 60);

      if (hours < 24) {
        return `${hours} hours ago`;
      }

      const days = Math.floor(hours / 24);

      return `${days} days ago`;
    }

    return "N/A";
  }

  // ... (rest of the component code)

  // New computed property to get the formatted last activity time
  get lastActivityTimeFormatted() {
    if (this.lastActivityTime && this.lastActivityTime !== "N/A") {
      const timeParts = this.lastActivityTime.split(' ');
      const timeValue = parseInt(timeParts[0], 10);
      const timeUnit = timeParts[1].toLowerCase();

      if (timeUnit.startsWith('day')) {
        return `${timeValue}d`;
      } else if (timeUnit.startsWith('hour')) {
        return `${timeValue}h`;
      } else if (timeUnit.startsWith('minute')) {
        return `${timeValue}m`;
      } else if (timeUnit.startsWith('second')) {
        return `${timeValue}s`;
      }
    }

    return "N/A";
  }
}

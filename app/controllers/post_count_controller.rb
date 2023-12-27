class PostCountController < ApplicationController
  def show
    @categories = Category.includes(topics: { posts: :topic }).all
    response_data = build_response
    render json: response_data
  end

  private

  def build_response
    {
      total_categories: @categories.count,
      categories: @categories.map do |category|
        parent_category_name = category.parent_category.present? ? category.parent_category.name : nil
        subcategories = find_subcategories(category)

        {
          category_id: category.id,
          category_name: category.name,
          parent_category_name: parent_category_name,
          topics_count: category.topics.count,
          subcategories_count: subcategories.count,
          subcategories: subcategories,
          topics: latest_update_post_date_in_category(category)
        }
      end,
      subcategories: find_all_subcategories
    }
  end

  def latest_update_post_date_in_category(category)
    all_update_dates = []
    all_topic_names = []

    category.topics.each do |topic|
      latest_update_date = topic.posts.map { |post| post.updated_at || post.created_at }.compact.max
      all_update_dates << latest_update_date
      all_topic_names << topic.title
    end

    latest_update_date = all_update_dates.compact.max

    {
      latest_update_post_date: latest_update_date,
      all_topic_names: all_topic_names
    }
  end

  def find_subcategories(parent_category)
    @categories.select { |category| category.parent_category == parent_category }.map do |subcategory|
      {
        subcategory_id: subcategory.id,
        subcategory_name: subcategory.name,
        parent_category_name: subcategory.parent_category.name
        # Add other subcategory details if needed
      }
    end
  end

  def find_all_subcategories
    @categories.select { |category| category.parent_category.present? }.map do |subcategory|
      {
        subcategory_id: subcategory.id,
        subcategory_name: subcategory.name,
        parent_category_name: subcategory.parent_category.name
        # Add other subcategory details if needed
      }
    end
  end
end

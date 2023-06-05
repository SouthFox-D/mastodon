# frozen_string_literal: true

class AddExclusiveToLists < ActiveRecord::Migration[6.1]
  def up
    add_column :lists, :exclusive, :boolean, null: false, default: false
    puts 'Updating exclusive columns'
    safety_assured { execute "UPDATE lists SET exclusive = is_exclusive" }
  end

  def down
    remove_column :lists, :exclusive
  end

end

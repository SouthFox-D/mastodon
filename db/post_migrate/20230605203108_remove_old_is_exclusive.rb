# frozen_string_literal: true

class RemoveOldIsExclusive < ActiveRecord::Migration[5.2]
  disable_ddl_transaction!

  def change
    safety_assured { remove_column :lists, :is_exclusive }
  end
end

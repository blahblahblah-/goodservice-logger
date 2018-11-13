require 'clockwork'
require './config/boot'
require './config/environment'

module Clockwork
  handler do |job|
    puts "Running #{job}"
  end

  # handler receives the time when job is prepared to run in the 2nd argument
  # handler do |job, time|
  #   puts "Running #{job}, at #{time}"
  # end

  every(30.seconds, 'update.data') {
    puts "Updating Headways"
    startTime = Time.current
    ScheduleProcessor.instance.refresh_data
    midTime = Time.current
    puts "Refreshed data in #{midTime - startTime} seconds"
  }
end
require 'nyct-subway.pb'
require 'net/http'
require 'uri'

class ScheduleProcessor
  include Singleton
  BASE_URI = "http://datamine.mta.info/mta_esi.php"
  FEED_IDS = [1, 26, 16, 21, 2, 11, 31, 36, 51]

  def initialize
    refresh_data
  end

  def refresh_data
    instantiate_data

    if Rails.env.production?
      feeds = Parallel.map(FEED_IDS, in_threads: 4) do |id|
        begin
          retries ||= 0
          puts "Spawning thread for #{id}"
          feed = retrieve_feed(id)
          puts "Analyzing feed #{id}"
          Rails.cache.write("feed-data-#{id}-#{Time.current.min}", feed, expires_in: 10.minutes)
          analyze_feed(feed, id)
          puts "Done analyzing feed #{id}"
        rescue StandardError => e
          puts "Error: #{e} from feed #{id}"
          if (retries += 1) < 3
            sleep(1)
            retry
          end
        end
      end
    else
      FEED_IDS.each do |id|
        begin
          retries ||= 0
          feed = Rails.cache.fetch("feed-#{id}", expires_in: 1.minute) do
            retrieve_feed(id)
          end
          analyze_feed(feed, id)
        rescue StandardError => e
          puts "Error: #{e} from feed #{id}"
          retry if (retries += 1) < 3
        end
      end
    end
  end

  private

  attr_accessor :timestamp, :recent_trips

  def retrieve_feed(feed_id)
    puts "Retrieving feed #{feed_id}"
    data = Net::HTTP.get(URI.parse("#{BASE_URI}?key=#{ENV["MTA_KEY"]}&feed_id=#{feed_id}"))
    Transit_realtime::FeedMessage.decode(data)
  end

  def analyze_feed(feed, id)
    raise "Error: Empty feed" if feed.entity.empty?
    puts "Feed id #{id}, timestamp: #{feed.header.timestamp}"
    for entity in feed.entity do
      if entity.field?(:trip_update) && entity.trip_update.trip.nyct_trip_descriptor
        next if entity.trip_update.stop_time_update.all? {|update| (update&.departure || update&.arrival).time < feed.header.timestamp }
        direction = entity.trip_update.trip.nyct_trip_descriptor.direction.to_i 
        route_id = route(entity.trip_update.trip.route_id)
        trip = Display::Trip.new(route_id, entity.trip_update, direction, feed.header.timestamp, recent_trips)
      end
    end
  end

  def instantiate_data
    @timestamp = Time.current
    instantiate_recent_trips
  end

  def instantiate_recent_trips
    @recent_trips = ActualTrip.includes(:actual_trip_updates).where("created_at > ?", Time.current - 3.hours)
  end

  def route(route_id)
    route_id = "SI" if route_id == "SS"
    route_id = "5" if route_id == "5X"
    route_id
  end
end
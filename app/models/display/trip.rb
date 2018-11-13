module Display
  class Trip
    TIME_ESTIMATE_LIMIT = 60.minutes.to_i

    attr_accessor :route_id, :timestamp, :direction

    def initialize(route_id, trip, direction, timestamp, recent_trips)
      @route_id = route_id
      @trip = trip
      @direction = direction
      @timestamp = timestamp
      @recent_trips = recent_trips
      log_trip
    end

    def last_stop
      trip.stop_time_update.map(&:stop_id).last
    end

    def lines
      line_directions.map(&:line)
    end

    def find_time(stop_id)
      update = trip.stop_time_update.find { |u|
        u.stop_id == stop_id
      }
      return unless update
      (update.departure || update.arrival).time
    end

    def trip_id
      trip.trip.trip_id
    end

    def delay
      return actual_trip.latest_update_delay if next_stop == actual_trip.latest_update_next_stop
      return 0
    end

    private

    attr_accessor :trip, :recent_trips

    def arrival_time
      @arrival_time if @arrival_time

      update = trip.stop_time_update.last
      @arrival_time = (update.arrival || update.departure).time
    end

    def next_stop
      trip.stop_time_update.first.stop_id
    end

    def next_stop_time
      update = trip.stop_time_update.first
      (update.departure || update.arrival).time
    end

    def log_trip
      return unless (next_stop_time - timestamp) <= 600

      diff = arrival_time - actual_trip.latest_estimated_arrival_time

      return unless diff.abs >= 60.0

      puts "Trip #{trip_id} updated, diff: #{diff}, new estimated arrival: #{arrival_time}"
      update = actual_trip.actual_trip_updates.find { |u| u.next_stop == next_stop } || actual_trip.actual_trip_updates.new(next_stop: next_stop, diff: 0)
      update.timestamp = timestamp
      update.diff += diff
      update.new_arrival_estimate = arrival_time
      update.save!

      if actual_trip.first_stop_departure_timestamp.nil? && next_stop != actual_trip.first_stop_id
        puts "Trip #{trip_id} departed from #{actual_trip.first_stop_id} at #{timestamp}"
        actual_trip.first_stop_departure_timestamp = timestamp
        actual_trip.save!
      end

      if update.diff > 300
        puts "Logging delay for trip #{trip_id}, #{update.diff / 60} minutes"
        actual_trip.log_delay!(update.diff)
      end
    end

    def actual_trip
      return @actual_trip if @actual_trip

      @actual_trip ||= recent_trips.find { |rt| rt.trip_id == trip_id && rt.route_id == route_id }
      @actual_trip ||= ActualTrip.create!(
        date: Date.current,
        trip_id: trip_id,
        route_id: route_id,
        first_stop_id: next_stop,
        timestamp: timestamp,
        initial_arrival_estimate: arrival_time,
        first_stop_departure_estimate: next_stop_time
      )
      @actual_trip
    end
  end
end
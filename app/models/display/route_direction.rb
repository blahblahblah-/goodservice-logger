module Display
  class RouteDirection

    def initialize(route_id, stop_times, timestamp)
      @route_id = route_id
      @trips = []
      @stop_times = stop_times
      @timestamp = timestamp
    end

    def push_trip(trip)
      trips << trip
    end

    def destinations
      trips&.map(&:last_stop).uniq.map { |id|
        Stop.find_by(internal_id: id).stop_name
      }
    end

    def destination_stops
      routings.map(&:last).uniq
    end

    def routings
      trips.map(&:stops).sort_by(&:size).reverse.inject([]) do |memo, stops_array|
        unless memo.any? { |array| (stops_array - array).empty? }
          memo << stops_array
        end
        memo
      end
    end

    def line_directions
      return [] if trips.empty?
      @line_directions ||= line_directions_data.map do |ld|
        Display::RouteLineDirection.new(route_id, ld, trips, stop_times, timestamp)
      end
    end

    def headway_discreprency
      return nil if trips.empty?
      line_directions.map(&:headway_discreprency).reject { |headway_discreprency|
        headway_discreprency.nil?
      }.max
    end

    def delay
      line_directions.map(&:delay).max || 0
    end

    private

    attr_accessor :trips, :stop_times, :route_id, :timestamp

    def line_directions_data
      return @line_directions_data if @line_directions_data

      arrays = trips.map { |t|
        t.line_directions.reverse
      }.sort_by { |ld|
        ld.size
      }.reverse

      head, *rest = arrays

      @line_directions_data = head.zip(*rest)&.flatten&.compact&.uniq.reverse
    end
  end
end
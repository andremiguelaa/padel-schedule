import axios from "axios";
import _ from "lodash";

import venuesSlugs from "./venues.json";

const getFreeSlots = async ({ date, time, duration }) =>
  new Promise((resolve) => {
    axios
      .get(`https://www.aircourts.com/index.php/v2/api/search`, {
        params: {
          city: 13,
          sport: 4,
          date,
          start_time: time,
          time_override: 1,
          page_size: 100000,
          page: 1,
          favorites: 0,
        },
      })
      .then((response) => {
        const slugsById = {};
        const clubIds = Object.values(
          _.keyBy(response.data.results, "slug")
        ).reduce((acc, venue) => {
          slugsById[venue.club_id] = venue;
          if (venuesSlugs.includes(venue.slug)) {
            const validSlots = venue.slots.filter(
              (slot) => slot.status === "available"
            );
            const courts = _.groupBy(validSlots, "court_id");
            Object.values(courts).forEach((value) => {
              if (value.length > 0) {
                acc.push(venue.club_id);
              }
            });
          }
          return acc;
        }, []);
        let clubPromises = [];
        clubIds.forEach((id) => {
          clubPromises.push(
            new Promise((clubResolve) => {
              axios
                .get(
                  `https://www.aircourts.com/index.php/api/search_with_club/${id}`,
                  {
                    params: {
                      sport: 4,
                      date,
                      start_time: time,
                    },
                  }
                )
                .then((response) => {
                  const slotsForCourt = [];
                  response.data.results.forEach((court) => {
                    court.slots.forEach((slot) => {
                      const durationInteger = parseInt(duration);
                      if (slot.durations?.includes(durationInteger)) {
                        slotsForCourt.push({ ...slot, court });
                      }
                    });
                  });
                  clubResolve({
                    venue: slugsById[id],
                    slots: slotsForCourt,
                  });
                });
            })
          );
        });
        Promise.all(clubPromises).then((values) => {
          resolve(values);
        });
      });
  });

const handler = async (req, res) => {
  const data = await getFreeSlots(req.query);
  res.status(200).json(data);
};

export default handler;

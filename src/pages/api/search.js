import axios from "axios";
import { format, add } from "date-fns";
import _ from "lodash";

import venuesSlugs from "./venues.json";

const getFreeSlots = async ({ date, time, duration }) =>
  new Promise((resolve) => {
    const minDate = new Date(`${date}T${time}:00`);
    const maxDate = add(minDate, { hours: 3 });
    axios
      .get(`https://playtomic.io/api/v1/tenants`, {
        params: {
          user_id: "me",
          playtomic_status: "ACTIVE",
          coordinate: "38.722252,-9.139337",
          sport_id: "PADEL",
          radius: 50000,
        },
      })
      .then((response) => {
        const validVenues = response.data.filter((item) =>
          venuesSlugs.includes(item.tenant_uid)
        );
        const clubIds = validVenues.map((item) => item.tenant_id);
        const venuesById = _.keyBy(validVenues, "tenant_id");
        let clubPromises = [];
        clubIds.forEach((id) => {
          clubPromises.push(
            new Promise((clubResolve) => {
              axios
                .get(`https://playtomic.io/api/v1/availability`, {
                  params: {
                    user_id: "me",
                    tenant_id: id,
                    sport_id: "PADEL",
                    local_start_min: format(minDate, "yyyy-MM-dd'T'HH:mm:00"),
                    local_start_max: format(maxDate, "yyyy-MM-dd'T'HH:mm:00"),
                  },
                })
                .then((response) => {
                  const slotsForCourt = [];
                  response.data.forEach((court) => {
                    const courtInfo = venuesById[id].resources.find(
                      (item) => item.resource_id === court.resource_id
                    );

                    court.slots.forEach((slot) => {
                      if (slot.duration === parseInt(duration)) {
                        slotsForCourt.push({ ...courtInfo, ...slot });
                      }
                    });
                  });
                  clubResolve({
                    venue: venuesById[id],
                    slots: slotsForCourt,
                  });
                })
                .catch(() => {
                  clubResolve();
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

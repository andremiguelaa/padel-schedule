import { useState } from "react";
import axios from "axios";
import { uniqBy } from "lodash";
import { format } from "date-fns";

import "bulma/css/bulma.css";

const roofTypes = {
  outdoor: "Descoberto",
  indoor: "Indoor",
  roofed: "Coberto",
};

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [date, setDate] = useState();

  const selectedDate = format(new Date(date || 0), "yyyy-MM-dd");

  return (
    <main>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          setLoading(true);
          setData();
          axios
            .get(`/api/search`, {
              params: {
                date: formData.get("date"),
                time: formData.get("time"),
                duration: formData.get("duration"),
              },
            })
            .then((response) => {
              setDate(formData.get("date"));
              setData(response.data.filter((item) => item.slots.length));
              setLoading(false);
            });
        }}
      >
        <div className="pt-2 pl-2 pr-2">
          <div className="field">
            <label className="label">
              Date
              <div>
                <input
                  style={{ width: "150px" }}
                  disabled={loading}
                  className="input"
                  name="date"
                  type="date"
                  placeholder="Text input"
                  required
                  min={today.toISOString().slice(0, 10)}
                  defaultValue={tomorrow.toISOString().slice(0, 10)}
                />
              </div>
            </label>
          </div>
          <div className="field">
            <label className="label">
              Time
              <div>
                <div className="select">
                  <select name="time" disabled={loading} defaultValue="19:00">
                    <option value="00:00">00:00</option>
                    <option value="00:30">00:30</option>
                    <option value="01:00">01:00</option>
                    <option value="01:30">01:30</option>
                    <option value="02:00">02:00</option>
                    <option value="02:30">02:30</option>
                    <option value="03:00">03:00</option>
                    <option value="03:30">03:30</option>
                    <option value="04:00">04:00</option>
                    <option value="04:30">04:30</option>
                    <option value="05:00">05:00</option>
                    <option value="05:30">05:30</option>
                    <option value="06:00">06:00</option>
                    <option value="06:30">06:30</option>
                    <option value="07:00">07:00</option>
                    <option value="07:30">07:30</option>
                    <option value="08:00">08:00</option>
                    <option value="08:30">08:30</option>
                    <option value="09:00">09:00</option>
                    <option value="09:30">09:30</option>
                    <option value="10:00">10:00</option>
                    <option value="10:30">10:30</option>
                    <option value="11:00">11:00</option>
                    <option value="11:30">11:30</option>
                    <option value="12:00">12:00</option>
                    <option value="12:30">12:30</option>
                    <option value="13:00">13:00</option>
                    <option value="13:30">13:30</option>
                    <option value="14:00">14:00</option>
                    <option value="14:30">14:30</option>
                    <option value="15:00">15:00</option>
                    <option value="15:30">15:30</option>
                    <option value="16:00">16:00</option>
                    <option value="16:30">16:30</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                    <option value="18:00">18:00</option>
                    <option value="18:30">18:30</option>
                    <option value="19:00">19:00</option>
                    <option value="19:30">19:30</option>
                    <option value="20:00">20:00</option>
                    <option value="20:30">20:30</option>
                    <option value="21:00">21:00</option>
                    <option value="21:30">21:30</option>
                    <option value="22:00">22:00</option>
                    <option value="22:30">22:30</option>
                    <option value="23:00">23:00</option>
                    <option value="23:30">23:30</option>
                    <option value="24:00">24:00</option>
                  </select>
                </div>
              </div>
            </label>
          </div>
          <div className="field">
            <label className="label">
              Duration
              <div>
                <div className="select">
                  <select name="duration" disabled={loading} defaultValue="90">
                    <option value="30">30 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                  </select>
                </div>
              </div>
            </label>
          </div>
          <div className="field">
            <button
              className={`button is-primary ${loading ? "is-loading" : ""}`}
              disabled={loading}
            >
              Procurar
            </button>
          </div>
        </div>
        {data?.length > 0 && (
          <output>
            <div className="content pb-4">
              <hr />
              <div className="pl-2 pr-2">
                {data.map((item) => (
                  <div key={item.venue.tenant_id} className="panel">
                    <p className="panel-heading mb-0">
                      <a
                        href={`https://playtomic.io/${item.venue.tenant_uid}/${item.venue.tenant_id}?q=PADEL~${date}~~~`}
                        target="_blank"
                      >
                        {item.venue.tenant_name}
                      </a>
                    </p>
                    <div className="panel-block pb-5">
                      <ul>
                        {uniqBy(
                          item.slots,
                          (item) => item.start_time + item.name
                        )
                          .sort((a, b) =>
                            a.start_time.localeCompare(b.start_time)
                          )
                          .map((slot) => (
                            <li key={slot.start_time}>
                              {format(
                                new Date(
                                  `${selectedDate}T${slot.start_time}.000Z`
                                ),
                                "HH:mm"
                              )}{" "}
                              ({roofTypes[slot.properties.resource_type]}
                              {slot.properties.resource_size == "single"
                                ? " / Individual"
                                : ""}
                              )
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </output>
        )}
      </form>
    </main>
  );
}

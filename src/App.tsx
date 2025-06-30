/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

// function shuffle(array) {
//   let currentIndex = array.length;

//   // While there remain elements to shuffle...
//   while (currentIndex != 0) {
//     // Pick a remaining element...
//     let randomIndex = Math.floor(Math.random() * currentIndex);
//     currentIndex--;

//     // And swap it with the current element.
//     [array[currentIndex], array[randomIndex]] = [
//       array[randomIndex],
//       array[currentIndex],
//     ];
//   }

//   return array;
// }

// const LETTERS = shuffle(
//   " 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ:@&#()/".split("")
// );

const LETTERS = " 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ:@&#()/-".split("");

function Character({ targetLetter }: { targetLetter: string }) {
  const [letter, setLetter] = useState(" ");
  const [flipState, setFlipState] = useState<
    "still" | "topflip" | "bottomflip"
  >("still");

  const nextLetter = LETTERS[(LETTERS.indexOf(letter) + 1) % LETTERS.length];

  const topDisplayLetter = flipState === "still" ? letter : nextLetter;

  useEffect(() => {
    const flip = () => {
      setFlipState("topflip");
      setTimeout(() => {
        setFlipState("bottomflip");
        setTimeout(() => {
          setFlipState("still");
          setLetter(nextLetter);
        }, 50);
      }, 50);
    };

    if (letter !== targetLetter) {
      flip();
    }
  }, [targetLetter, letter, nextLetter]);

  return (
    <div className="flex flex-col gap-px w-8 relative">
      {/* Top flap behind */}
      <div className="rounded-t-[25%] w-8 h-7 bg-black relative overflow-clip text-white">
        <p className="text-2xl left-0 right-0 absolute text-center bottom-0 translate-y-4 scale-y-150">
          {topDisplayLetter}
        </p>
      </div>

      {/* Bottom flap behind */}
      <div className="rounded-b-[25%] w-8 h-7 bg-black relative overflow-clip text-white">
        <p className="text-2xl left-0 right-0 absolute text-center top-0 -translate-y-4 scale-y-150">
          {letter}
        </p>
      </div>

      {/* Top flap in front */}
      <div className="absolute top-0 h-7 flex flex-col justify-end">
        <div
          className={
            "rounded-t-[25%] w-8 h-7 bg-black overflow-clip origin-bottom text-white " +
            (flipState === "topflip"
              ? "scale-y-0 transition-transform ease-linear duration-50"
              : "scale-y-100 opacity-0")
          }
        >
          <p className="text-2xl left-0 right-0 absolute text-center bottom-0 translate-y-4 scale-y-150">
            {letter}
          </p>
        </div>
      </div>

      {/* Bottom flap in front */}
      <div className="absolute h-7 bottom-0 flex flex-col justify-start">
        <div
          className={
            "rounded-b-[25%] w-8 h-7 bg-black relative overflow-clip origin-top text-white " +
            (flipState === "bottomflip"
              ? "scale-y-100 transition-transform ease-linear duration-50"
              : "scale-y-0 opacity-0")
          }
        >
          <p className="text-2xl left-0 right-0 absolute text-center top-0 -translate-y-4 scale-y-150">
            {nextLetter}
          </p>
        </div>
      </div>
    </div>
  );
}

function TextRow({ length, word }: { length: number; word: string }) {
  return (
    <div className="flex flex-row gap-2">
      {Array.from({ length }).map((_, i) => (
        <Character targetLetter={word.toUpperCase()[i] ?? " "} />
      ))}
    </div>
  );
}

function App() {
  const [predictions, setPredictions] = useState(
    Array.from({ length: 10 }).map(() => "")
  );

  useEffect(() => {
    let stale = false;

    const date = new Date().toISOString().substring(0, 10);

    const url = `https://api-v3.mbta.com/schedules?filter[stop]=place-sstat&filter[route_type]=2&filter[date]=${date}&filter[min_time]=${new Date().getHours()}:${new Date()
      .getMinutes()
      .toString()
      .padStart(2, "0")}&sort=departure_time`;

    console.log(url);

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!stale) {
          setPredictions(
            data.data
              .filter((p: any) => p.attributes.stop_headsign)
              .map((p: any) => {
                const trainId = p.relationships.trip.data.id
                  .split("-")
                  .at(-1)
                  .padStart(4, " ");
                const headsign = (p.attributes.stop_headsign ?? "")
                  .substring(0, 18)
                  .padEnd(18, " ");

                const status = [
                  "ON TIME   ",
                  "BOARDING  ",
                  "ALL ABOARD",
                  "DELAYED   ",
                  "CANCELLED ",
                ][0];

                const time = new Date(p.attributes.departure_time);

                return `${trainId} ${headsign} ${status} ${time
                  .getHours()
                  .toString()
                  .padStart(2, " ")}:${time
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`;
              })
              .slice(0, 10)
          );
        }
      });

    return () => {
      stale = true;
    };
  }, []);

  const [rowsRevealed, setRowsRevealed] = useState(0);

  useEffect(() => {
    if (predictions.find((p) => p)) {
      const interval = setInterval(() => setRowsRevealed((i) => i + 1), 5000);

      return () => clearInterval(interval);
    }
  }, [predictions]);

  return (
    <div className="w-full h-full grid place-content-center">
      <div className="flex flex-col gap-y-2 bg-gray-500 p-4">
        <div className="flex flex-row items-start justify-between">
          <div className="flex flex-col gap-2">
            <TextRow
              length={12}
              word={0 <= rowsRevealed ? "SUNDAY      " : ""}
            />
            <TextRow
              length={12}
              word={
                1 <= rowsRevealed
                  ? `${(new Date().getMonth() + 1)
                      .toString()
                      .padStart(2, "0")}-${new Date()
                      .getDate()
                      .toString()
                      .padStart(2, "0")}-${new Date()
                      .getFullYear()
                      .toString()
                      .padStart(4, "0")}`
                  : ""
              }
            />
          </div>
          <p className="text-center text-white text-3xl scale-y-125">
            SOUTH STATION TRAIN INFORMATION
          </p>
          <div className="flex flex-col gap-2">
            <TextRow
              length={12}
              word={0 <= rowsRevealed ? "CURRENT TIME" : ""}
            />
            <TextRow
              length={12}
              word={
                1 <= rowsRevealed
                  ? `    ${(new Date().getHours() % 12)
                      .toString()
                      .padStart(2, " ")}:${new Date()
                      .getMinutes()
                      .toString()
                      .padStart(2, "0")} ${
                      new Date().getHours() >= 12 ? "PM" : "AM"
                    }`
                  : ""
              }
            />
          </div>
        </div>
        <br className="m-4" />
        <TextRow
          length={40}
          word={
            2 <= rowsRevealed ? "TRN# DESTINATION        STATUS     TIME " : ""
          }
        />
        {predictions.map((p, i) => (
          <TextRow length={40} key={i} word={i + 3 <= rowsRevealed ? p : ""} />
        ))}
      </div>
    </div>
  );
}

export default App;

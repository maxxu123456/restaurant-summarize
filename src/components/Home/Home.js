import { useEffect, useRef, useState } from "react";
import { OPENAI_KEY } from "../../keys";
import "./Home.css";
import OpenAI from "openai";
import ClipLoader from "react-spinners/ClipLoader";

const openai = new OpenAI({
  apiKey: OPENAI_KEY,
  dangerouslyAllowBrowser: true,
});

function Home() {
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");
  let [searchText, setSearchText] = useState("");
  let [search, setSearch] = useState({place: "Delarosa"});
  let [location, setLocation] = useState({location: ""});
  const [response, setResponse] = useState({ sentiment: "", dishes: "" });
  async function getPlaceId(query) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append(
      "X-Goog-Api-Key",
      "AIzaSyC8HBJDAT3pNt-FO3ygr6NdaeJ2f2FKVSA"
    );
    myHeaders.append("X-Goog-FieldMask", "*");

    var urlencoded = new URLSearchParams();
    urlencoded.append("textQuery", query);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };

    return fetch(
      "https://places.googleapis.com/v1/places:searchText",
      requestOptions
    ).then((response) => response.text());
  }
  async function getReviews(query) {
    let x = await getPlaceId(query);
    x = JSON.parse(x);
    const placeId = x.places[0].id;
    var myHeaders = new Headers();
    myHeaders.append("X-Goog-FieldMask", "reviews");
    myHeaders.append(
      "X-Goog-Api-Key",
      "AIzaSyC8HBJDAT3pNt-FO3ygr6NdaeJ2f2FKVSA"
    );
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    let result = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      requestOptions
    ).then((response) => response.text());
    result = JSON.parse(result);
    let reviews = result.reviews;
    let reviewTexts = reviews.map((review) => {
      return review.text.text;
    });

    let [sentiment, dishes] = await Promise.all([
      getSentiment(reviewTexts),
      notableDishes(reviewTexts),
    ]);
    sentiment = sentiment.choices[0].message.content;
    dishes = dishes.choices[0].message.content;
    setResponse({
      sentiment: sentiment,
      dishes: dishes.replace(/ *\([^)]*\) */g, ""),
    });
    setLoading(false);
    console.log(sentiment);
    console.log(dishes);
  }

  function getSentiment(reviews) {

    let contentString = "";
    for (const review of reviews) {
      contentString += review;
    }
    return openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content:
            "Give the a summary of the general sentiment of the restaurant with the following reviews: " +
            contentString,
        },
      ],
      model: "gpt-3.5-turbo",
    });
  }
  function notableDishes(reviews) {
    let contentString = "";
    for (const review of reviews) {
      contentString += review;
    }
    return openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content:
            "Give a breakdown of the reccomended dishes with a brief description of each food dish with a new line character separating each item and a number in front of each item. Only give a list of food dishes. For each dish that you list, give a brief description of the item. Here is the reviews that contain the dishes: " +
            contentString,
        },
      ],
      model: "gpt-3.5-turbo",
    });
  }

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    console.log(e.target.value);
  };
  function handleSubmit(event) {
    setLocation(search);
    event.preventDefault();
  }

  function handleChange(event) {
    setSearch(event.target.value);
  }

  return (
    <div className="center-horizontal">
      <section className="flex-container">
        <div className="image-group">
          <div className="title">
            <img className="search-bear-icon" src="./search-bear.png"></img>
            <span>Rest-Review</span>
          </div>


          {/* <input className="location-box" value="Restaurant Name"></input> */}
          <form onSubmit={handleSubmit}>
            <input type="text" value={search.place} onChange={handleChange} className="location-box"/>
            {/* <input type="submit" value="Submit" /> */}
          </form>
          {/* <img className="res-image" src="./testimage.jpg"/> */}
          <iframe width="600" className="res-image" height="450" loading="lazy" allowfullscreen
            src={`https://www.google.com/maps/embed/v1/place?q=${location}&key=AIzaSyBXVuclOKs8BC2ru7PfGinjwcd2CcOpcbQ`}>
          </iframe>
          <div className="consensus-container">
            <h2>
              <img className="icon" src="./chat-bubble-icon.svg"></img>General
              Consensus
              <ClipLoader
                color={color}
                loading={loading}
                size={25}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </h2>
            <span className="consensus">{response.sentiment}</span>
          </div>
        </div>
        <div className="flex-row">
          <div className="dishes-container">
            <h2>
              <img className="icon" src="./note-icon.svg"></img>Notable Dishes
              <ClipLoader
                color={color}
                loading={loading}
                size={25}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </h2>
            <div className="dishes-list">
              {response.dishes.split("\n").map((s) => {
                return <span>{s}</span>;
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

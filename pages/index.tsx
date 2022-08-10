import useSWR from 'swr'

import Head from 'next/head';

import Layout from '../components/layout';
import { ICat, Cat } from '../components/cat';
import { Guesses } from '../components/guesses';

import React, { useState, useEffect, Component } from "react";
import { ifError } from 'assert';

import styles from './index.module.scss';

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faCakeCandles, faChampagneGlasses, faGift } from '@fortawesome/free-solid-svg-icons';
import { off } from 'process';

const fetcher = (url: URL) => fetch(url).then((res) => res.json())

interface ICatRaw {
  name: string,
  mainImage: string,
  images: string[],
  details: {},
  url: string
}

const Index = (props: any) => {

  function resetGame() {
    console.log("resetting stats - new day");

    //Reset Data for Today
    setHintFlags([]);
    setHint([]);
    setShowWin(false)
    localStorage.removeItem("continue");
    setCorrects([])
    setCurrentGuess("")
    setTurnNumber(0)
    setGuesses([])
    localStorage.removeItem("win");
    setShowWin(false)
    setShowLose(false)
    setWin(false);

    localStorage.setItem("playedToday", JSON.stringify(new Date()));
  }

  function getTodaysCat(cats: ICatRaw[]): ICat {
    let today = new Date();
    console.log("TODAY: " + today);
    let c = cats[0];

    if (!localStorage.getItem("playedToday")) {
      //They haven't played so reset today's stats and save off yesterday's stats
      resetGame();
    }

    if (localStorage.getItem("playedToday")) {
      let pt = JSON.parse(localStorage.getItem("playedToday") as string);

      let date = new Date(pt);

      console.log("playedToday: " + date.toString());

      if (date.getFullYear() < today.getFullYear() ||
        (date.getFullYear() === today.getFullYear() && date.getMonth() < today.getMonth()) ||
        (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() < today.getDate())) {
        //is earlier than today so reset data
        resetGame();
      }
    }

    if (today.getDate() === 9) {
      c = cats[20];
      console.log("CAT 9th: " + c.name)
    } else if (today.getDate() === 10) {
      c = cats[40];
      console.log("CAT 10th: " + c.name)
    }

    console.log(c.name);

    return {
      name: c.name,
      images: [c.mainImage, ...c.images],
      details: c.details,
      url: c.url
    }
  }

  function takeTurn(guess: string) {
    //set flag in storage to say game has started
    localStorage.setItem("continue", "true");

    setCurrentGuess(guess);
    console.log("currentGuess: " + currentGuess);

    let currentCorrect = compareGuess();
    console.log(currentCorrect);

    setGuesses(guesses => [...guesses, currentGuess])
    setCorrects(corrects => [...corrects, currentCorrect])

    //update hint
    let h = [];
    let hf = [...hintFlags];
    // console.log("hint flags");
    // console.log(hintFlags)
    let trimmedName = cat.name.trim();
    for (let i = 0; i < trimmedName.length; i++) {
      if (!hf[i]) {
        // console.log("looking for: " + trimmedName[i]);
        let flag = false;
        for (let j = 0; j < currentGuess.length; j++) {
          if (trimmedName[i] === " ") {
            // console.log("is space");
            h.push(" ");
            flag = true;
            break;
          } else if (trimmedName[i] === "-") {
            h.push("-");
            flag = true;
            break;
          } else if (currentGuess[j].toLowerCase() === trimmedName[i].toLowerCase()) {
            // console.log("found!");

            h.push(trimmedName[i])
            hf[i] = true

            flag = true;
            break;
          }
        }

        if (!flag) {
          h.push("_");
          console.log("no flag")
        }
      } else {
        h.push(trimmedName[i]);
      }
    }
    console.log(h)
    console.log(hf)
    setHint(h)
    setHintFlags(hf)

    setTurnNumber(turnNumber + 1);

    if (currentGuess.toLowerCase() === cat.name.toLowerCase().trim()) {
      setWin(true)
      localStorage.setItem("win", "true");
      window.scrollTo(0, 0);
      setShowWin(true)

      //setData
      localStorage.setItem("todaysData", JSON.stringify({
        turnNumber: turnNumber,
        date: new Date(),
        win: true
      }))

      if (!localStorage.getItem("savedData")) {
        localStorage.setItem("savedData", JSON.stringify([{
          turnNumber: turnNumber,
          date: new Date(),
          win: true
        }]))
      } else {
        let sd = localStorage.getItem("savedData") as string;

        localStorage.setItem("savedData", JSON.stringify([...JSON.parse(sd), {
          turnNumber: turnNumber,
          date: new Date(),
          win: true
        }]))
      }
      return;
    }

    if (turnNumber == 4) {
      localStorage.setItem("lose", "true");
      window.scrollTo(0, 0);
      setShowLose(true);

      //setData
      localStorage.setItem("todaysData", JSON.stringify({
        turnNumber: turnNumber,
        date: new Date(),
        win: false
      }))

      if (!localStorage.getItem("savedData")) {
        localStorage.setItem("savedData", JSON.stringify([{
          turnNumber: turnNumber,
          date: new Date(),
          win: false
        }]))
      } else {
        let sd = localStorage.getItem("savedData") as string;

        localStorage.setItem("savedData", JSON.stringify([...JSON.parse(sd), {
          turnNumber: turnNumber,
          date: new Date(),
          win: false
        }]))
      }
      return;
    }

    setCurrentGuess("")
  }

  function compareGuess(): number[] {
    let corrects = [];

    let trimmedName = cat.name.trim();
    // console.log("answer: :" + trimmedName)
    // console.log("guess: " + currentGuess);


    // console.log("comparing guess:");
    for (let j = 0; j < currentGuess.length; j++) {
      let flag = false;
      for (let i = 0; i < trimmedName.length; i++) {
        // console.log("comparing: " + currentGuess[j].toLowerCase() + " to: " + trimmedName[i].toLowerCase());
        if (trimmedName[i].toLowerCase() == currentGuess[j].toLowerCase()) {
          corrects.push(1);
          flag = true;
          // console.log("FOUND!")
          break;
        }
      }

      if (!flag) {
        corrects.push(0);
        // console.log("NOT FOUND!")
      }

    }

    return corrects;
  }

  let cats: ICatRaw[] = [];
  const { data, error } = useSWR('/api/staticdata', fetcher)

  useEffect(() => {
    if (data !== undefined) {
      cats = JSON.parse(data);

      let ca = getTodaysCat(cats);
      setCat(getTodaysCat(cats));

      if (localStorage.getItem("continue") == null) {
        console.log("no continue so reset hint and flags");
        //set hint
        let h = []
        let hf = []
        for (const c of ca.name) {
          if (c === " ") {
            h.push(" ");
            hf.push(true)
          } else if (c === "-") {
            h.push("-");
            hf.push(true)
          } else {
            h.push("_");
            hf.push(false)
          }
        }
        setHint(h)
        setHintFlags(hf)
      }
    }
  }, [data])

  //set laura card
  useEffect(() => {
    const windowUrl = window.location.search.substring(1, window.location.search.length);
    if (windowUrl === "birthday") {
      setShowLauraCard(true);
      setShowRules(false);
    }
  }, [])

  let blankCat = {
    name: "Blank",
    images: [],
    details: {},
    url: "blank"
  }

  const baseUrl = "https://www.catbreedslist.com";

  const [currentGuess, setCurrentGuess] = useState("")
  const [turnNumber, setTurnNumber] = useState(0)
  const [guesses, setGuesses] = useState<string[]>([])
  const [corrects, setCorrects] = useState<number[][]>([])
  const [cat, setCat] = useState<ICat>(blankCat)
  const [hint, setHint] = useState<string[]>([])
  const [hintFlags, setHintFlags] = useState<boolean[]>([])
  const [showRules, setShowRules] = useState<boolean>(true)
  const [showWin, setShowWin] = useState<boolean>(false)
  const [showLose, setShowLose] = useState<boolean>(false)
  const [showLauraCard, setShowLauraCard] = useState<boolean>(false)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [win, setWin] = useState<boolean>(false)

  //get localstorage
  useEffect(() => {
    let gs = localStorage.getItem("guesses");
    let cs = localStorage.getItem("corrects");
    let tn = localStorage.getItem("turnNumber");

    let sr = localStorage.getItem("showRules");

    let w = localStorage.getItem("win");
    let l = localStorage.getItem("lose");

    let h = localStorage.getItem("hint");
    let hf = localStorage.getItem("hintFlags");

    if (w != null) {
      setShowRules(false);
      setShowWin(true);
      setWin(true);
    }

    if (l != null) {
      setShowLose(true);
      setShowRules(false);
    }

    if (sr != null) {
      setShowRules(false);
    }

    if (gs != null) {
      let gs2 = JSON.parse(gs);
      setGuesses(gs2);
    }

    if (cs != null) {
      let cs2 = JSON.parse(cs);
      setCorrects(cs2);
    }

    if (h != null) {
      let h2 = JSON.parse(h);
      setHint(h2);
    }

    if (hf != null) {
      let hf2 = JSON.parse(hf);
      setHintFlags(hf2);
    }

    if (tn != null) {
      console.log("ls turn number: " + tn + " | " + parseInt(tn))
      setTurnNumber(parseInt(tn));
    }

    setGameStarted(true)
  }, [])

  useEffect(() => {
    if (gameStarted) {
      //local storage
      localStorage.setItem("turnNumber", turnNumber.toString());
    }
  }, [turnNumber, gameStarted])

  useEffect(() => {
    if (gameStarted) {
      //local storage
      localStorage.setItem("guesses", JSON.stringify(guesses));
    }
  }, [guesses, gameStarted])

  useEffect(() => {
    if (gameStarted) {
      //local storage
      localStorage.setItem("corrects", JSON.stringify(corrects));
    }
  }, [corrects, gameStarted])

  useEffect(() => {
    // console.log("SETTING: hint - GAME NOT STARTED");
    if (gameStarted) {
      //local storage
      // console.log("SETTING: hint - " + hint);
      localStorage.setItem("hint", JSON.stringify(hint));
    }
  }, [hint])

  useEffect(() => {
    // console.log("SETTING: hintFlags - GAME NOT STARTED");
    if (gameStarted) {
      //local storage
      // console.log("SETTING: hintFlags - " + hintFlags);
      localStorage.setItem("hintFlags", JSON.stringify(hintFlags));
    }
  }, [hintFlags])

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  return (
    <div>
      <Head>
        <title>Purrdle &#128049;</title>
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </Head>
      <Layout>
        {
          showLauraCard &&
          <>
            <div className={styles.cover}></div>
            <div className={styles.win}>
              <h2><FontAwesomeIcon icon={faChampagneGlasses} shake /> <FontAwesomeIcon icon={faCakeCandles} bounce /></h2>
              <h2>Happy Birthday Laura!</h2>
              <h2><FontAwesomeIcon icon={faCakeCandles} bounce /> <FontAwesomeIcon icon={faChampagneGlasses} shake /></h2>

              <img src="https://i.imgflip.com/5i849s.gif" alt="birthday cat" />

              <p className={styles.birthdayMessage} style={{ textAlign: "left" }}>To Laura</p>
              <p className={styles.birthdayMessage}>Hope you&apos;re having a wonderful day!</p>
              <p className={styles.birthdayMessage}>To open your present, click &apos;Start&apos; below!</p>
              <p className={styles.birthdayMessage} style={{ textAlign: "right" }}>Love Tom</p>
              <button onClick={() => { setShowLauraCard(false); setShowRules(true); }}>Start <FontAwesomeIcon icon={faPaw} /></button>
            </div>
          </>
        }
        {showRules &&
          <>
            <div className={styles.cover}></div>
            <div className={styles.win}>
              <h2>Rules</h2>
              <p>Attempt to name the pictured cat breed (changes every day)</p>
              <p>With each guess, the cat picture will get less blurred.</p>
              <p>Some cats have multiple photos, tap on the cat photo to toggle to the next one.</p>
              <p><span style={{ color: "green" }}>Green</span> letters are in the breed&apos;s name.</p>
              <p><span style={{ color: "red" }}>Red</span> letters are not.</p>
              <p>Click &quot;Show Hint&quot; if you want to see the letter positions you&apos;ve got correct so far.</p>
              <button className={styles.small} onClick={() => { setShowRules(false); localStorage.setItem("showRules", "false"); }}>Close &amp; Play <FontAwesomeIcon icon={faPaw} /></button>
            </div>
          </>
        }
        {showWin &&
          <>
            <div className={styles.cover}></div>
            <div className={styles.win}>
              <h2>MEOW! <FontAwesomeIcon icon={faPaw} bounce /></h2>
              <img src="https://c.tenor.com/GwTRUJal39sAAAAd/cat-happy-cat.gif" alt="happy cat" />
              <h3>CORRECT in {turnNumber} {(turnNumber) === 1 ? "guess" : "guesses"}!</h3>
              <h3 className={styles.red}>The answer was <a style={{ textDecoration: "underline" }} href={baseUrl + cat.url} target="_blank" rel="noreferrer">{cat.name}</a>!</h3>
              <span className={styles.guesses}>Your Guesses:</span>
              <div className={styles.guessesList}>
                {guesses.map((item, i) => {
                  return <div key={i}>{i + 1}. {item}</div>
                })}
              </div>
              <button onClick={() => { setShowWin(false); }} style={{ marginTop: "20px" }}>Hide</button>
            </div>
          </>
        }
        {showLose &&
          <>
            <div className={styles.cover}></div>
            <div className={styles.lose}>
              <h2>Aww! <FontAwesomeIcon icon={faPaw} shake /></h2>
              <img src="https://s36537.pcdn.co/wp-content/uploads/2018/05/A-gray-cat-crying-looking-upset.jpg.optimal.jpg" alt="sad cat" />
              <h3 className={styles.red}>The answer was <a style={{ textDecoration: "underline" }} href={baseUrl + cat.url} target="_blank" rel="noreferrer">{cat.name}</a>!</h3>
              <p className={styles.small}>Click above to learn more!</p>
              <span className={styles.guesses}>Your Guesses:</span>
              <div className={styles.guessesList} style={{ marginBottom: "20px;" }}>
                {guesses.map((item, i) => {
                  return <div key={i}>{i + 1}. {item}</div>
                })}
              </div>
              <button className={styles.button} onClick={() => { setShowLose(false) }}>Close <FontAwesomeIcon icon={faPaw} /></button>
            </div>
          </>
        }
        <Cat name={cat.name} images={cat.images} details={cat.details} url={cat.url} turnNumber={turnNumber} win={win} />
        <Guesses turnNumber={turnNumber} takeTurn={takeTurn} currentGuess={currentGuess} setCurrentGuess={setCurrentGuess} guesses={guesses} corrects={corrects} hint={hint} showRules={showRules} setShowRules={setShowRules} hasWon={win} />
      </Layout>
    </div>
  )
}

export default Index;
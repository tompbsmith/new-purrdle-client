import styles from './guesses.module.scss';

import React, { useEffect, useState } from 'react';

export interface ICat {
    name: string,
    images: string[],
    details: {},
    url: string
}

const baseUrl = "https://www.catbreedslist.com";

import { faPaw } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const Guesses = ({ takeTurn, turnNumber, currentGuess, setCurrentGuess, guesses, corrects, hint, showRules, setShowRules, hasWon }: any) => {
    const [showHint, setShowHint] = useState(false);

    let previousGuesses = corrects.map((correct: number[], i: number) => {
        let answer = correct.map((c: number, j: number) => {
            return <span key={j} style={{ color: (c === 1) ? 'green' : 'red' }}>{guesses[i][j]}</span>
        })

        return <div key={i} className={styles.guess}>{answer}</div>
    })

    let hintHTML = hint.map((item: string, i: number) => {
        if (item === " ") {
            return <span key={i} className={styles.hintSpace}></span>
        } else {
            return <span key={i} className={styles.hintLetter}>{item} </span>
        }
    })



    return (
        <>
            <div className={styles.buttons}><button onClick={() => setShowRules(!showRules)} className={`${styles.button} ${styles.small}`}>{showRules ? "Hide" : "Show"} Rules</button><button className={`${styles.button} ${styles.small}`} onClick={() => setShowHint(!showHint)}>{showHint ? "Hide" : "Show"} Hint</button></div>
            {showHint ? <div className={styles.hint}>{hintHTML}</div> : null}
            <div className={styles.layout}>
                <div>{previousGuesses}</div>
                {(turnNumber < 5 && !hasWon) ?
                    <>
                        <input type="text" className={styles.input} value={currentGuess} onChange={event => setCurrentGuess(event.target.value)} />
                        <button className={styles.button} onClick={() => { takeTurn(currentGuess); }}>Guess <FontAwesomeIcon icon={faPaw} /></button>
                    </> :
                    <></>}

            </div>
        </>
    )
}
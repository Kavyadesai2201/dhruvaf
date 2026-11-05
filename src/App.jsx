import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Headphones, Shuffle } from 'lucide-react'
import { songs } from './data/songs'
import { siteContent } from './siteContent'
import './App.css'

const TILTS = [-3, 2, -1.5, 3.5, -2.5, 1.5, -4]
const tiltFor = (id) => `${TILTS[id % TILTS.length]}deg`
const fallback = (e) => { e.currentTarget.src = '/images/placeholder-memory.svg' }
const subtitleOf = (s) => s.artist || s.film

function Polaroid({ song, onClick, className = '', children }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className={`polaroid ${className}`} style={{ '--tilt': tiltFor(song.id) }} onClick={onClick}>
      <span className="tape" aria-hidden="true" />
      <img src={song.image} alt={`Memory for ${song.title}`} loading="lazy" onError={fallback} />
      {children}
    </Tag>
  )
}

function SpotifyPlayer({ song }) {
  const [embedError, setEmbedError] = useState(false)
  if (!song.spotifyTrackId || embedError) {
    return (
      <div className="player-fallback">
        <Headphones size={18} />
        <span>Spotify could not load this track. <a href={song.spotifyUrl} target="_blank" rel="noreferrer">Open it on Spotify</a></span>
      </div>
    )
  }
  return (
    <div className="player">
      <iframe
        src={`https://open.spotify.com/embed/track/${song.spotifyTrackId}?utm_source=generator&theme=0`}
        title={`Spotify player for ${song.title}`}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        onError={() => setEmbedError(true)}
      />
      <a className="spotify-link" href={song.spotifyUrl} target="_blank" rel="noreferrer">Open on Spotify <ArrowUpRight size={14} /></a>
    </div>
  )
}

function Opening({ onEnter }) {
  const { heading, subtitle, introduction, buttonLabel } = siteContent.opening
  const [num, ...rest] = heading.split(' ')
  const hero = [songs[0], songs[6], songs[16]]
  return (
    <main className="opening page">
      <section className="opening-text">
        <h1><span className="num">{num}</span> {rest.join(' ')}</h1>
        <p className="lead">{subtitle}</p>
        <p className="muted">{introduction}</p>
        <button className="btn" onClick={onEnter}>{buttonLabel}</button>
      </section>
      <div className="drop-cluster" aria-hidden="true">
        {hero.map((s, i) => (
          <Polaroid key={s.id} song={s} className={`drop drop-${i}`}>
            <span className="cap"><b>{s.title}</b></span>
          </Polaroid>
        ))}
      </div>
    </main>
  )
}

function Closing({ onReturn }) {
  const { heading, message, buttonLabel } = siteContent.closing
  return (
    <main className="closing page enter">
      <span className="num ghost" aria-hidden="true">21</span>
      <h1>{heading}</h1>
      <p className="lead">{message}</p>
      <button className="btn" onClick={onReturn}><ArrowLeft size={16} /> {buttonLabel}</button>
    </main>
  )
}

function Home({ onSelect, onClose }) {
  const surprise = () => onSelect(songs[Math.floor(Math.random() * songs.length)])
  return (
    <main className="home page enter">
      <header className="top">
        <span className="hand-mark">21 years of you</span>
        <button className="link" onClick={surprise}><Shuffle size={15} /> Play a random one</button>
      </header>
      <section className="home-intro">
        <h1>The wall of <span className="scribble">us</span></h1>
        <p className="muted">Twenty-one songs, twenty-one photos, twenty-one notes. Pick any polaroid.</p>
      </section>
      <section className="wall" aria-label="21 songs">
        {songs.map((song) => (
          <Polaroid key={song.id} song={song} className="slot" onClick={() => onSelect(song)}>
            <span className="cap">
              <b>{song.title}</b>
              <i>{subtitleOf(song)}</i>
              <span className="pno">{song.id}</span>
            </span>
          </Polaroid>
        ))}
      </section>
      <footer className="foot">
        <span className="hand-mark">made for a very special 21st</span>
        <button className="link" onClick={onClose}>Read the last note <ArrowRight size={14} /></button>
      </footer>
    </main>
  )
}

function SongExperience({ song, onBack, onSelectSong }) {
  const i = songs.findIndex((s) => s.id === song.id)
  const prev = songs[i - 1]
  const next = songs[i + 1]

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft' && prev) onSelectSong(prev)
      if (e.key === 'ArrowRight' && next) onSelectSong(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onSelectSong])

  return (
    <main className="song page enter">
      <nav className="bar">
        <button className="link" onClick={onBack}><ArrowLeft size={16} /> The wall</button>
        <span className="hand-mark">{song.id} of 21</span>
        <span className="pager">
          <button className="link" onClick={() => onSelectSong(prev)} disabled={!prev} aria-label="Previous song"><ArrowLeft size={16} /></button>
          <button className="link" onClick={() => onSelectSong(next)} disabled={!next} aria-label="Next song"><ArrowRight size={16} /></button>
        </span>
      </nav>
      <div className="song-grid">
        <Polaroid song={song} className="big" key={song.id}>
          <span className="cap"><b>{song.title}</b><span className="pno">{song.id}</span></span>
        </Polaroid>
        <div className="song-copy" key={`c${song.id}`}>
          <h1>{song.title}</h1>
          <p className="muted">{subtitleOf(song)}{song.year ? `, ${song.year}` : ''}</p>
          <p className="slip-title">a little note for you</p>
          <p className="slip">{song.note}</p>
          <SpotifyPlayer song={song} />
        </div>
      </div>
    </main>
  )
}

export default function App() {
  const [screen, setScreen] = useState('opening')
  const [song, setSong] = useState(null)
  const select = (s) => { setSong(s); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  return (
    <>
      {screen === 'opening' && <Opening onEnter={() => setScreen('home')} />}
      {screen === 'home' && (song
        ? <SongExperience song={song} onBack={() => setSong(null)} onSelectSong={select} />
        : <Home onSelect={select} onClose={() => setScreen('closing')} />)}
      {screen === 'closing' && <Closing onReturn={() => setScreen('home')} />}
    </>
  )
}

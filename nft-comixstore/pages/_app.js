/* pages/_app.js */
import '../styles/globals.css'
import Link from 'next/link'
import "@fontsource/bangers";


function Marketplace({ Component, pageProps }) {

  

  return (
    <div style={{backgroundImage: "url('https://i.pinimg.com/originals/ac/47/82/ac47826b7853f260ae8e98251de1b513.png')"}}>
      <nav className="border-b p-6" id="navDiv" style={{textAlign: 'center', backgroundImage: "url('https://www.pcgameshardware.de/screenshots/1280x/2018/09/comics-header-background-v3-pcgh.jpg')"}}>
        <p className="text-4xl font-bold" style = {{ fontFamily : 'Bangers', color : '#FFFFFF'}}>comXstore</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-pink-500" style ={{color : '#FFFFFF' }}>
              Shelter
            </a>
          </Link>
          <Link href="/create-item">
            <a className="mr-6 text-pink-500" style ={{color : '#FFFFFF' }}>
              Sell Digital Asset
            </a>
          </Link>
          <Link href="/my-assets">
            <a className="mr-6 text-pink-500" style ={{color : '#FFFFFF' }}>
              My Digital Assets
            </a>
          </Link>
          <Link href="/creator-dashboard">
            <a className="mr-6 text-pink-500" style ={{color : '#FFFFFF' }}>
              Creator Dashboard
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>




  )
}

export default Marketplace
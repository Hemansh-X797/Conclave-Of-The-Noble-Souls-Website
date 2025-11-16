import React from 'react';

const Sitemap = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '36px', color: '#2c3e50' }}>Sitemap</h1>
      <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
        {/* Main Pages */}
        <li style={{ fontSize: '20px', marginBottom: '10px' }}>
          <a href="/about-us" style={linkStyle}>About Us</a>
        </li>
        <li style={{ fontSize: '20px', marginBottom: '10px' }}>
          <a href="/contact-us" style={linkStyle}>Contact Us</a>
        </li>
        <li style={{ fontSize: '20px', marginBottom: '10px' }}>
          <a href="/faq" style={linkStyle}>FAQ</a>
        </li>
        <li style={{ fontSize: '20px', marginBottom: '10px' }}>
          <a href="/terms-and-conditions" style={linkStyle}>Terms & Conditions</a>
        </li>
        <li style={{ fontSize: '20px', marginBottom: '10px' }}>
          <a href="/privacy-policy" style={linkStyle}>Privacy Policy</a>
        </li>

        {/* Main Sections */}
        <li style={{ fontSize: '24px', marginTop: '20px', fontWeight: 'bold', color: '#34495e' }}>
          <a href="/luxury" style={linkStyle}>Luxury Experience</a>
          <ul style={subListStyle}>
            <li><a href="/luxury/concierge" style={linkStyle}>Concierge Services</a></li>
            <li><a href="/luxury/marketplace" style={linkStyle}>Global Marketplace</a></li>
            <li><a href="/luxury/showcase" style={linkStyle}>Exclusive Showcases</a></li>
          </ul>
        </li>

        <li style={{ fontSize: '24px', marginTop: '20px', fontWeight: 'bold', color: '#34495e' }}>
          <a href="/gaming" style={linkStyle}>Gaming Realm</a>
          <ul style={subListStyle}>
            <li><a href="/gaming/tournaments" style={linkStyle}>Tournaments</a></li>
            <li><a href="/gaming/leaderboards" style={linkStyle}>Leaderboards</a></li>
            <li><a href="/gaming/game-reviews" style={linkStyle}>Game Reviews</a></li>
          </ul>
        </li>

        <li style={{ fontSize: '24px', marginTop: '20px', fontWeight: 'bold', color: '#34495e' }}>
          <a href="/lorebound" style={linkStyle}>Otaku Sanctuary</a>
          <ul style={subListStyle}>
            <li><a href="/lorebound/library" style={linkStyle}>Manga/Anime Library</a></li>
            <li><a href="/lorebound/reviews" style={linkStyle}>Reviews</a></li>
            <li><a href="/lorebound/community" style={linkStyle}>Community</a></li>
          </ul>
        </li>

        <li style={{ fontSize: '24px', marginTop: '20px', fontWeight: 'bold', color: '#34495e' }}>
          <a href="/productive" style={linkStyle}>Productivity Palace</a>
          <ul style={subListStyle}>
            <li><a href="/productive/tools" style={linkStyle}>Productivity Tools</a></li>
            <li><a href="/productive/showcase" style={linkStyle}>Member Showcase</a></li>
            <li><a href="/productive/challenges" style={linkStyle}>Challenges</a></li>
            <li><a href="/productive/achievements" style={linkStyle}>Achievements</a></li>
          </ul>
        </li>

        {/* Exclusive Content & VIP Areas */}
        <li style={{ fontSize: '24px', marginTop: '20px', fontWeight: 'bold', color: '#34495e' }}>
          <a href="/exclusives" style={linkStyle}>Exclusive Content</a>
          <ul style={subListStyle}>
            <li><a href="/exclusives/limited-edition" style={linkStyle}>Limited Edition</a></li>
            <li><a href="/exclusives/invites" style={linkStyle}>Invite-Only Events</a></li>
          </ul>
        </li>
        <li style={{ fontSize: '24px', marginTop: '20px', fontWeight: 'bold', color: '#34495e' }}>
          <a href="/vip-areas" style={linkStyle}>VIP Areas</a>
          <ul style={subListStyle}>
            <li><a href="/vip-areas/lounge" style={linkStyle}>VIP Lounge</a></li>
            <li><a href="/vip-areas/concierge" style={linkStyle}>VIP Concierge</a></li>
          </ul>
        </li>

        {/* Global Community */}
        <li style={{ fontSize: '24px', marginTop: '20px', fontWeight: 'bold', color: '#34495e' }}>
          <a href="/global-community" style={linkStyle}>Global Community</a>
          <ul style={subListStyle}>
            <li><a href="/global-community/regions" style={linkStyle}>Regional Exclusives</a></li>
            <li><a href="/global-community/partners" style={linkStyle}>International Partners</a></li>
          </ul>
        </li>

        {/* Miscellaneous */}
        <li style={{ fontSize: '24px', marginTop: '20px', fontWeight: 'bold', color: '#34495e' }}>
          <a href="/blog" style={linkStyle}>Blog</a>
          <ul style={subListStyle}>
            <li><a href="/blog/post/first-post" style={linkStyle}>First Blog Post</a></li>
            <li><a href="/blog/post/second-post" style={linkStyle}>Second Blog Post</a></li>
          </ul>
        </li>
        <li style={{ fontSize: '24px', marginTop: '20px', fontWeight: 'bold', color: '#34495e' }}>
          <a href="/members" style={linkStyle}>Members</a>
        </li>
        <li style={{ fontSize: '24px', marginTop: '20px', fontWeight: 'bold', color: '#34495e' }}>
          <a href="/memberstats" style={linkStyle}>Member Stats</a>
        </li>
      </ul>
    </div>
  );
};

const linkStyle = {
  textDecoration: 'none',
  color: '#2980b9',
  fontWeight: 'normal',
  fontSize: '18px',
};

const subListStyle = {
  listStyleType: 'circle',
  marginLeft: '20px',
  paddingLeft: '20px',
};

export default Sitemap;

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CNS Divine Dashboard - Cursor System Demo</title>
    <style>
        :root {
            --noble-white: #f8f8ff;
            --noble-black: #0a0a0a;
            --cns-gold: #ffd700;
            --royal-purple: #6a0dad;
            --divine-silver: #e5e4e2;
            --gaming-blue: #00bfff;
            --lore-pink: #ff1493;
            --productive-green: #50c878;
            --news-red: #e0115f;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            cursor: none !important;
        }

        body {
            background: linear-gradient(135deg, var(--noble-black), #1a1a2e, #0f0f23);
            color: var(--noble-white);
            font-family: 'Playfair Display', 'Times New Roman', serif;
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
        }

        /* ===== DIVINE CURSOR SYSTEM ===== */
        .cns-cursor-dot {
            width: 8px;
            height: 8px;
            background: var(--cns-gold);
            border-radius: 50%;
            position: fixed;
            pointer-events: none;
            z-index: 10000;
            transition: all 0.15s ease-out;
            opacity: 0.9;
        }

        .cns-cursor-ring {
            width: 50px;
            height: 50px;
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
            opacity: 0.6;
        }

        /* Default & Hover States */
        .cns-cursor-dot.default {
            width: 8px;
            height: 8px;
            background: var(--cns-gold);
        }

        .cns-cursor-ring.default {
            width: 20px;
            height: 20px;
            border: 1px solid var(--cns-gold);
            border-radius: 50%;
        }

        .cns-cursor-dot.hover {
            width: 4px;
            height: 4px;
            background: var(--noble-white);
        }

        .cns-cursor-ring.hover {
            width: 50px;
            height: 50px;
            border: 2px solid var(--cns-gold);
            border-radius: 50%;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
        }

        /* Gaming Pathway - Crosshair */
        .cns-cursor-dot.gaming {
            width: 6px;
            height: 6px;
            background: var(--gaming-blue);
            box-shadow: 0 0 15px rgba(0, 191, 255, 0.8);
            animation: gamingPulse 1.5s ease-in-out infinite;
        }

        .cns-cursor-ring.gaming {
            width: 60px;
            height: 60px;
            border: none;
            background: none;
            position: relative;
        }

        .cns-cursor-ring.gaming::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 40px;
            height: 2px;
            background: var(--gaming-blue);
            transform: translate(-50%, -50%);
            box-shadow: 0 0 10px rgba(0, 191, 255, 0.6);
        }

        .cns-cursor-ring.gaming::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 2px;
            height: 40px;
            background: var(--gaming-blue);
            transform: translate(-50%, -50%);
            box-shadow: 0 0 10px rgba(0, 191, 255, 0.6);
        }

        @keyframes gamingPulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.3); opacity: 1; }
        }

        /* Lorebound Pathway - Mystical Rune */
        .cns-cursor-dot.lorebound {
            width: 8px;
            height: 8px;
            background: var(--lore-pink);
            box-shadow: 0 0 15px rgba(255, 20, 147, 0.7);
        }

        .cns-cursor-ring.lorebound {
            width: 55px;
            height: 55px;
            border: none;
            background: none;
            position: relative;
            animation: loreboundRotate 4s linear infinite;
        }

        .cns-cursor-ring.lorebound::before {
            content: '✦';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 30px;
            color: var(--lore-pink);
            text-shadow: 0 0 20px rgba(255, 20, 147, 0.8);
            animation: loreboundGlow 2s ease-in-out infinite alternate;
        }

        @keyframes loreboundRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        @keyframes loreboundGlow {
            from { text-shadow: 0 0 20px rgba(255, 20, 147, 0.6); }
            to { text-shadow: 0 0 30px rgba(255, 20, 147, 1); }
        }

        /* Productive Pathway - Grid Compass */
        .cns-cursor-dot.productive {
            width: 6px;
            height: 6px;
            background: var(--productive-green);
            box-shadow: 0 0 12px rgba(80, 200, 120, 0.7);
        }

        .cns-cursor-ring.productive {
            width: 45px;
            height: 45px;
            border: none;
            background: none;
            position: relative;
        }

        .cns-cursor-ring.productive::before {
            content: '';
            position: absolute;
            top: 5px;
            left: 5px;
            right: 5px;
            bottom: 5px;
            border: 2px solid var(--productive-green);
            border-radius: 4px;
            box-shadow: 0 0 15px rgba(80, 200, 120, 0.5);
        }

        .cns-cursor-ring.productive::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 2px;
            background: var(--productive-green);
            transform: translate(-50%, -50%);
            box-shadow: 
                0 -8px 0 var(--productive-green),
                0 8px 0 var(--productive-green),
                -8px 0 0 var(--productive-green),
                8px 0 0 var(--productive-green);
        }

        /* News Pathway - Lightning */
        .cns-cursor-dot.news {
            width: 8px;
            height: 8px;
            background: var(--news-red);
            box-shadow: 0 0 18px rgba(224, 17, 95, 0.9);
            animation: newsEnergy 1s ease-in-out infinite;
        }

        .cns-cursor-ring.news {
            width: 65px;
            height: 65px;
            border: none;
            background: none;
            position: relative;
        }

        .cns-cursor-ring.news::before {
            content: '⚡';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 35px;
            color: var(--news-red);
            text-shadow: 0 0 25px rgba(224, 17, 95, 0.8);
            animation: newsLightning 0.8s ease-in-out infinite alternate;
        }

        @keyframes newsEnergy {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.2); }
            75% { transform: scale(0.9); }
        }

        @keyframes newsLightning {
            from { 
                text-shadow: 0 0 25px rgba(224, 17, 95, 0.6);
                transform: translate(-50%, -50%) rotate(-2deg);
            }
            to { 
                text-shadow: 0 0 35px rgba(224, 17, 95, 1);
                transform: translate(-50%, -50%) rotate(2deg);
            }
        }

        /* Text Selection */
        .cns-cursor-dot.text { display: none; }
        .cns-cursor-ring.text {
            width: 2px;
            height: 30px;
            border-radius: 2px;
            border: 1px solid var(--cns-gold);
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }

        /* ===== DASHBOARD LAYOUT ===== */
        .dashboard-container {
            display: grid;
            grid-template-areas: 
                "sidebar header header"
                "sidebar main main"
                "sidebar footer footer";
            grid-template-columns: 280px 1fr 1fr;
            grid-template-rows: 80px 1fr 60px;
            min-height: 100vh;
            gap: 1px;
            background: rgba(10, 10, 10, 0.5);
        }

        /* Header */
        .dashboard-header {
            grid-area: header;
            background: linear-gradient(90deg, rgba(248, 248, 255, 0.08), rgba(106, 13, 173, 0.04));
            border-bottom: 1px solid rgba(255, 215, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
            backdrop-filter: blur(20px);
        }

        .logo {
            font-size: 1.8rem;
            font-weight: 300;
            color: var(--cns-gold);
            text-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
            letter-spacing: 0.1em;
        }

        .user-profile {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.5rem 1rem;
            background: rgba(255, 215, 0, 0.1);
            border-radius: 50px;
            border: 1px solid rgba(255, 215, 0, 0.3);
            transition: all 0.3s ease;
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            background: linear-gradient(45deg, var(--cns-gold), var(--royal-purple));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--noble-black);
            font-weight: bold;
        }

        /* Sidebar */
        .dashboard-sidebar {
            grid-area: sidebar;
            background: linear-gradient(180deg, rgba(248, 248, 255, 0.05), rgba(106, 13, 173, 0.02));
            border-right: 1px solid rgba(255, 215, 0, 0.2);
            padding: 2rem 1rem;
            backdrop-filter: blur(15px);
        }

        .nav-section {
            margin-bottom: 2.5rem;
        }

        .nav-title {
            color: var(--cns-gold);
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-bottom: 1rem;
            opacity: 0.8;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-radius: 12px;
            transition: all 0.3s ease;
            margin-bottom: 0.5rem;
            text-decoration: none;
            color: var(--divine-silver);
        }

        .nav-item:hover {
            background: rgba(255, 215, 0, 0.1);
            transform: translateX(8px);
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.1);
        }

        .nav-icon {
            font-size: 1.2rem;
            width: 20px;
            text-align: center;
        }

        /* Main Content */
        .dashboard-main {
            grid-area: main;
            padding: 2rem;
            overflow-y: auto;
        }

        .welcome-banner {
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(106, 13, 173, 0.08));
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 20px;
            padding: 2rem;
            margin-bottom: 2rem;
            backdrop-filter: blur(20px);
            text-align: center;
        }

        .pathway-showcase {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }

        .pathway-card {
            background: linear-gradient(145deg, rgba(248, 248, 255, 0.05), rgba(106, 13, 173, 0.02));
            border: 1px solid rgba(255, 215, 0, 0.15);
            border-radius: 20px;
            padding: 2rem;
            transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
            backdrop-filter: blur(15px);
            position: relative;
            overflow: hidden;
            height: 200px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .pathway-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent);
            transition: left 0.8s ease-out;
        }

        .pathway-card:hover::before {
            left: 100%;
        }

        .pathway-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 25px 50px rgba(255, 215, 0, 0.2);
            border-color: var(--cns-gold);
        }

        .gaming-realm {
            background: linear-gradient(145deg, rgba(0, 191, 255, 0.1), rgba(106, 13, 173, 0.03));
            border-color: rgba(0, 191, 255, 0.3);
        }

        .gaming-realm:hover {
            box-shadow: 0 25px 50px rgba(0, 191, 255, 0.3);
            border-color: var(--gaming-blue);
        }

        .lorebound-sanctum {
            background: linear-gradient(145deg, rgba(255, 20, 147, 0.1), rgba(106, 13, 173, 0.03));
            border-color: rgba(255, 20, 147, 0.3);
        }

        .lorebound-sanctum:hover {
            box-shadow: 0 25px 50px rgba(255, 20, 147, 0.3);
            border-color: var(--lore-pink);
        }

        .productive-nexus {
            background: linear-gradient(145deg, rgba(80, 200, 120, 0.1), rgba(106, 13, 173, 0.03));
            border-color: rgba(80, 200, 120, 0.3);
        }

        .productive-nexus:hover {
            box-shadow: 0 25px 50px rgba(80, 200, 120, 0.3);
            border-color: var(--productive-green);
        }

        .heralds-court {
            background: linear-gradient(145deg, rgba(224, 17, 95, 0.1), rgba(106, 13, 173, 0.03));
            border-color: rgba(224, 17, 95, 0.3);
        }

        .heralds-court:hover {
            box-shadow: 0 25px 50px rgba(224, 17, 95, 0.3);
            border-color: var(--news-red);
        }

        .pathway-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }

        .pathway-title {
            color: var(--cns-gold);
            font-size: 1.4rem;
            margin-bottom: 0.5rem;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
            font-weight: 300;
            letter-spacing: 0.05em;
        }

        .pathway-desc {
            color: var(--divine-silver);
            font-size: 0.9rem;
            text-align: center;
            opacity: 0.8;
        }

        /* Activity Feed */
        .activity-section {
            background: rgba(248, 248, 255, 0.03);
            border: 1px solid rgba(255, 215, 0, 0.2);
            border-radius: 15px;
            padding: 2rem;
            margin-bottom: 2rem;
        }

        .activity-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-bottom: 1px solid rgba(255, 215, 0, 0.1);
            transition: all 0.3s ease;
        }

        .activity-item:hover {
            background: rgba(255, 215, 0, 0.05);
            padding-left: 1.5rem;
        }

        .activity-avatar {
            width: 35px;
            height: 35px;
            background: linear-gradient(45deg, var(--royal-purple), var(--cns-gold));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--noble-white);
            font-size: 0.8rem;
            font-weight: bold;
        }

        /* Interactive Elements */
        .divine-button {
            background: linear-gradient(135deg, var(--cns-gold), #b8860b);
            color: var(--noble-black);
            border: none;
            border-radius: 8px;
            padding: 0.75rem 2rem;
            font-weight: 600;
            letter-spacing: 0.05em;
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
            text-transform: uppercase;
            font-size: 0.9rem;
        }

        .divine-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(255, 215, 0, 0.4);
            background: linear-gradient(135deg, #ffed4a, var(--cns-gold));
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }

        .stat-card {
            background: rgba(248, 248, 255, 0.05);
            border: 1px solid rgba(255, 215, 0, 0.2);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            transition: all 0.3s ease;
        }

        .stat-card:hover {
            border-color: var(--cns-gold);
            box-shadow: 0 8px 25px rgba(255, 215, 0, 0.1);
        }

        .stat-number {
            font-size: 2rem;
            color: var(--cns-gold);
            font-weight: 300;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }

        .stat-label {
            color: var(--divine-silver);
            font-size: 0.9rem;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Footer */
        .dashboard-footer {
            grid-area: footer;
            background: linear-gradient(90deg, rgba(248, 248, 255, 0.05), rgba(106, 13, 173, 0.02));
            border-top: 1px solid rgba(255, 215, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--divine-silver);
            font-size: 0.9rem;
            opacity: 0.7;
        }

        /* Input Demo */
        .search-bar {
            background: rgba(248, 248, 255, 0.05);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 25px;
            padding: 0.75rem 1.5rem;
            color: var(--noble-white);
            font-size: 1rem;
            width: 300px;
            transition: all 0.3s ease;
        }

        .search-bar::placeholder {
            color: var(--divine-silver);
            opacity: 0.6;
        }

        .search-bar:focus {
            outline: none;
            border-color: var(--cns-gold);
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .dashboard-container {
                grid-template-areas: 
                    "header"
                    "main"
                    "footer";
                grid-template-columns: 1fr;
                grid-template-rows: 80px 1fr 60px;
            }
            
            .dashboard-sidebar {
                display: none;
            }
        }

        /* Scroll styling */
        ::-webkit-scrollbar {
            width: 6px;
        }

        ::-webkit-scrollbar-track {
            background: rgba(10, 10, 10, 0.5);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--cns-gold);
            border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #ffed4a;
        }
    </style>
</head>
<body>
    <!-- Custom Cursor System -->
    <div class="cns-cursor-dot" id="cursorDot"></div>
    <div class="cns-cursor-ring" id="cursorRing"></div>

    <div class="dashboard-container">
        <!-- Header -->
        <header class="dashboard-header">
            <div class="logo">⚔️ CONCLAVE OF THE NOBLE SOULS</div>
            <div style="display: flex; align-items: center; gap: 1.5rem;">
                <input type="text" class="search-bar" placeholder="Search the realm..." data-cursor="text">
                <div class="user-profile" data-cursor="hover">
                    <div class="user-avatar">NS</div>
                    <span>Noble Soul</span>
                </div>
            </div>
        </header>

        <!-- Sidebar Navigation -->
        <aside class="dashboard-sidebar">
            <div class="nav-section">
                <div class="nav-title">Navigation</div>
                <a href="#" class="nav-item" data-cursor="hover">
                    <span class="nav-icon">🏛️</span>
                    <span>The Great Hall</span>
                </a>
                <a href="#" class="nav-item" data-cursor="hover">
                    <span class="nav-icon">👑</span>
                    <span>Hall of Nobles</span>
                </a>
                <a href="#" class="nav-item" data-cursor="hover">
                    <span class="nav-icon">⚖️</span>
                    <span>The Court</span>
                </a>
            </div>

            <div class="nav-section">
                <div class="nav-title">Pathways</div>
                <a href="#" class="nav-item" data-cursor="gaming">
                    <span class="nav-icon">⚔️</span>
                    <span>Gaming Realm</span>
                </a>
                <a href="#" class="nav-item" data-cursor="lorebound">
                    <span class="nav-icon">✦</span>
                    <span>Lorebound Sanctum</span>
                </a>
                <a href="#" class="nav-item" data-cursor="productive">
                    <span class="nav-icon">🎯</span>
                    <span>Productive Nexus</span>
                </a>
                <a href="#" class="nav-item" data-cursor="news">
                    <span class="nav-icon">⚡</span>
                    <span>Herald's Court</span>
                </a>
            </div>

            <div class="nav-section">
                <div class="nav-title">Personal</div>
                <a href="#" class="nav-item" data-cursor="hover">
                    <span class="nav-icon">🏰</span>
                    <span>My Chamber</span>
                </a>
                <a href="#" class="nav-item" data-cursor="hover">
                    <span class="nav-icon">🎖️</span>
                    <span>Achievements</span>
                </a>
                <a href="#" class="nav-item" data-cursor="hover">
                    <span class="nav-icon">⚙️</span>
                    <span>Preferences</span>
                </a>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="dashboard-main">
            <div class="welcome-banner">
                <h1 style="font-size: 2.5rem; color: var(--cns-gold); margin-bottom: 1rem; text-shadow: 0 0 20px rgba(255, 215, 0, 0.4);">
                    Welcome to Your Divine Dashboard
                </h1>
                <p style="font-size: 1.1rem; opacity: 0.8;">
                    Move your cursor around to experience the magical transformations between realms
                </p>
            </div>

            <!-- Stats Overview -->
            <div class="stats-grid">
                <div class="stat-card" data-cursor="hover">
                    <div class="stat-number">1,247</div>
                    <div class="stat-label">Noble Members</div>
                </div>
                <div class="stat-card" data-cursor="hover">
                    <div class="stat-number">42</div>
                    <div class="stat-label">Active Nobles</div>
                </div>
                <div class="stat-card" data-cursor="hover">
                    <div class="stat-number">156</div>
                    <div class="stat-label">Daily Messages</div>
                </div>
                <div class="stat-card" data-cursor="hover">
                    <div class="stat-number">8.9</div>
                    <div class="stat-label">Nobility Rating</div>
                </div>
            </div>

            <!-- Pathway Showcase -->
            <h2 style="color: var(--cns-gold); font-size: 1.8rem; margin-bottom: 1.5rem; text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);">
                Explore the Divine Pathways
            </h2>
            
            <div class="pathway-showcase">
                <div class="pathway-card gaming-realm" data-cursor="gaming">
                    <div class="pathway-icon">⚔️</div>
                    <div class="pathway-title">Gaming Realm</div>
                    <div class="pathway-desc">Battle alongside fellow warriors in epic gaming adventures</div>
                </div>

                <div class="pathway-card lorebound-sanctum" data-cursor="lorebound">
                    <div class="pathway-icon">✦</div>
                    <div class="pathway-title">Lorebound Sanctum</div>
                    <div class="pathway-desc">Dive deep into anime, manga, and mystical storytelling</div>
                </div>

                <div class="pathway-card productive-nexus" data-cursor="productive">
                    <div class="pathway-icon">🎯</div>
                    <div class="pathway-title">Productive Nexus</div>
                    <div class="pathway-desc">Elevate your skills and achieve greatness together</div>
                </div>

                <div class="pathway-card heralds-court" data-cursor="news">
                    <div class="pathway-icon">⚡</div>
                    <div class="pathway-title">Herald's Court</div>
                    <div class="pathway-desc">Stay informed with breaking news and discussions</div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="activity-section">
                <h3 style="color: var(--cns-gold); margin-bottom: 1.5rem; font-size: 1.5rem;">Recent Noble Activities</h3>
                
                <div class="activity-item" data-cursor="hover">
                    <div class="activity-avatar">KN</div>
                    <div>
                        <div style="color: var(--cns-gold); font-weight: 600;">Knight_Noble</div>
                        <div style="font-size: 0.9rem; opacity: 0.7;">Completed Gaming Realm Tournament - 2 hours ago</div>
                    </div>
                </div>

                <div class="activity-item" data-cursor="hover">
                    <div class="activity-avatar">MS</div>
                    <div>
                        <div style="color: var(--cns-gold); font-weight: 600;">Mystic_Scholar</div>
                        <div style="font-size: 0.9rem; opacity: 0.7;">Posted new anime review in Lorebound Sanctum - 4 hours ago</div>
                    </div>
                </div>

                <div class="activity-item" data-cursor="hover">
                    <div class="activity-avatar">PL</div>
                    <div>
                        <div style="color: var(--cns-gold); font-weight: 600;">Productive_Lord</div>
                        <div style="font-size: 0.9rem; opacity: 0.7;">Shared productivity tips - 6 hours ago</div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                <button class="divine-button" data-cursor="hover">Enter Discord Server</button>
                <button class="divine-button" data-cursor="hover">View All Pathways</button>
                <button class="divine-button" data-cursor="hover">Member Directory</button>
            </div>
        </main>

        <!-- Footer -->
        <footer class="dashboard-footer">
            <p>© 2025 Conclave of the Noble Souls - Where Legends Unite</p>
        </footer>
    </div>

    <script>
        // Divine Cursor System - Complete Implementation
        let cursorDot = document.getElementById('cursorDot');
        let cursorRing = document.getElementById('cursorRing');
        let animationId;
        let targetPos = { x: 0, y: 0 };
        let currentPos = { x: 0, y: 0 };

        // Smooth cursor tracking
        function updateCursor(e) {
            targetPos.x = e.clientX;
            targetPos.y = e.clientY;
        }

        function animateCursor() {
            // Smooth interpolation for magnetic effect
            currentPos.x += (targetPos.x - currentPos.x) * 0.15;
            currentPos.y += (targetPos.y - currentPos.y) * 0.15;

            if (cursorDot && cursorRing) {
                // Dot follows immediately
                cursorDot.style.left = targetPos.x + 'px';
                cursorDot.style.top = targetPos.y + 'px';
                cursorDot.style.transform = 'translate(-50%, -50%)';
                
                // Ring follows with elegant delay
                cursorRing.style.left = currentPos.x + 'px';
                cursorRing.style.top = currentPos.y + 'px';
                cursorRing.style.transform = 'translate(-50%, -50%)';
            }

            animationId = requestAnimationFrame(animateCursor);
        }

        // Handle cursor state changes
        function handleMouseOver(e) {
            const target = e.target.closest('[data-cursor]');
            const isText = ['INPUT', 'TEXTAREA', 'P', 'H1', 'H2', 'H3', 'SPAN'].includes(e.target.tagName);
            
            if (isText && !target) {
                setCursorState('text');
            } else if (target) {
                const cursorType = target.dataset.cursor;
                setCursorState(cursorType || 'hover');
            }
        }

        function handleMouseOut(e) {
            const target = e.relatedTarget?.closest('[data-cursor]');
            const isText = e.relatedTarget && ['INPUT', 'TEXTAREA', 'P', 'H1', 'H2', 'H3', 'SPAN'].includes(e.relatedTarget.tagName);
            
            if (!target && !isText) {
                setCursorState('default');
            }
        }

        function setCursorState(state) {
            // Remove all states
            cursorDot.className = 'cns-cursor-dot';
            cursorRing.className = 'cns-cursor-ring';
            
            // Add new state
            cursorDot.classList.add(state);
            cursorRing.classList.add(state);
        }

        function handleMouseLeave() {
            cursorDot.style.opacity = '0';
            cursorRing.style.opacity = '0';
        }

        function handleMouseEnter() {
            cursorDot.style.opacity = '0.9';
            cursorRing.style.opacity = '0.6';
        }

        // Initialize cursor system
        function initCursor() {
            // Set initial positions
            cursorDot.style.position = 'fixed';
            cursorDot.style.left = '50%';
            cursorDot.style.top = '50%';
            cursorRing.style.position = 'fixed';
            cursorRing.style.left = '50%';
            cursorRing.style.top = '50%';

            // Add event listeners
            document.addEventListener('mousemove', updateCursor);
            document.addEventListener('mouseover', handleMouseOver);
            document.addEventListener('mouseout', handleMouseOut);
            document.addEventListener('mouseleave', handleMouseLeave);
            document.addEventListener('mouseenter', handleMouseEnter);

            // Start animation loop
            animateCursor();
        }

        // Wait for DOM to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initCursor);
        } else {
            initCursor();
        }

        // Add particle trail effect (very subtle)
        let particleTimeout;
        document.addEventListener('mousemove', (e) => {
            clearTimeout(particleTimeout);
            particleTimeout = setTimeout(() => {
                if (Math.random() > 0.97) {
                    const particle = document.createElement('div');
                    particle.style.cssText = `
                        position: fixed;
                        width: 1px;
                        height: 1px;
                        background: var(--cns-gold);
                        border-radius: 50%;
                        pointer-events: none;
                        left: ${e.clientX}px;
                        top: ${e.clientY}px;
                        opacity: 0.4;
                        z-index: 9997;
                        animation: fadeParticle 1.5s ease-out forwards;
                    `;
                    document.body.appendChild(particle);
                    setTimeout(() => particle.remove(), 1500);
                }
            }, 100);
        });

        // Particle animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeParticle {
                0% { opacity: 0.4; transform: scale(1); }
                50% { opacity: 0.2; transform: scale(1.5); }
                100% { opacity: 0; transform: scale(0); }
            }
        `;
        document.head.appendChild(style);

        // Add magnetic effect to cards
        document.querySelectorAll('.pathway-card, .stat-card, .nav-item').forEach(element => {
            element.addEventListener('mouseenter', function() {
                this.style.transform = this.style.transform.replace('scale(1)', 'scale(1.02)');
            });
            
            element.addEventListener('mouseleave', function() {
                this.style.transform = this.style.transform.replace('scale(1.02)', 'scale(1)');
            });
        });
    </script>
</body>
</html>
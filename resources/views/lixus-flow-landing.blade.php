<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="{{ asset('storage/favicon.svg') }}" type="image/svg+xml">

    <link rel="alternate icon" href="{{ asset('storage/favicon.svg') }}" type="image/svg+xml">

    <link rel="apple-touch-icon" href="{{ asset('storage/favicon.svg') }}">
    <title>Lixus Flow - The Current of Influence.</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">

    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'flow-pink': '#FF007A',
                        'flow-blue': '#0A2540',
                        'accent-yellow': '#FFC700',
                        'accent-green': '#00D09B',
                        'neutral-charcoal': '#212529',
                        'neutral-gray': '#6C757D',
                        'neutral-light-gray': '#E9ECEF',
                        'neutral-off-white': '#F8F9FA',
                    },
                    fontFamily: {
                        sans: ['Figtree', 'sans-serif'],
                        display: ['"Plus Jakarta Sans"', 'sans-serif'],
                    },
                }
            }
        }
    </script>

    <style>
        .gradient-bg {
            background-color: #f8f9fa;
            background-image: 
                radial-gradient(circle at 100% 0%, rgba(255, 0, 122, 0.05), transparent 30%),
                radial-gradient(circle at 0% 100%, rgba(10, 37, 64, 0.08), transparent 40%);
        }
    </style>

</head>
<body class="bg-neutral-off-white text-neutral-charcoal font-sans antialiased">

    <header class="bg-neutral-off-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-neutral-light-gray/60">
        <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
            <a href="#" class="flex items-center space-x-3">
                 <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 28V4H14" stroke="#0A2540" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M25 11.5C22.5 11.5 20.5 13 18 13C15.5 13 13.5 11.5 11 11.5" stroke="#FF007A" stroke-width="2.5" stroke-linecap="round"/>
                    <path d="M25 18.5C22.5 18.5 20.5 20 18 20C15.5 20 13.5 18.5 11 18.5" stroke="#0A2540" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
                <span class="font-display font-bold text-2xl text-flow-blue">Lixus Flow</span>
            </a>
            <div class="hidden md:flex items-center space-x-8">
                <a href="#how-it-works" class="text-flow-blue hover:text-flow-pink transition-colors font-semibold">Cara Kerja</a>
                <a href="#advantage" class="text-flow-blue hover:text-flow-pink transition-colors font-semibold">Keuntungan</a>
                <a href="#contact" class="text-flow-blue hover:text-flow-pink transition-colors font-semibold">Kontak</a>
            </div>
            <div class="flex items-center space-x-4">
                 <a href="/login" class="hidden sm:block text-flow-blue font-semibold px-5 py-2 rounded-lg hover:bg-neutral-light-gray transition-colors">Brand Login</a>
                 <a href="/communities" class="bg-flow-pink text-white font-bold px-5 py-2 rounded-lg hover:bg-opacity-90 shadow-lg shadow-flow-pink/30 transition">Join Community</a>
            </div>
        </nav>
    </header>

    <main>
        <section class="relative text-center py-24 sm:py-32 md:py-40 overflow-hidden gradient-bg">
            <div class="absolute inset-0 bg-flow-blue -z-10">
                <canvas id="living-network-animation"></canvas>
            </div>
            <div class="container mx-auto px-6 relative">
                <h1 class="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold text-flow-blue leading-tight">
                    Direct the Current of Influence.
                </h1>
                <p class="mt-4 font-display text-2xl text-flow-pink font-semibold">Arus Pengaruh Terkini.</p>
                <p class="mt-6 max-w-2xl mx-auto text-lg text-neutral-gray">
                    The first advocacy platform in Indonesia, connecting iconic brands with the nation's most authentic storytellers. This is where influence finds its flow.
                </p>
                <div class="mt-10">
                    <a href="#" class="bg-flow-blue text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-opacity-90 shadow-xl shadow-flow-blue/30 transition-transform hover:scale-105">Become a Partner</a>
                </div>
            </div>
        </section>

        <section id="how-it-works" class="py-20 bg-white">
            <div class="container mx-auto px-6">
                <div class="text-center mb-16">
                    <h2 class="font-display text-4xl font-bold text-flow-blue">Launch Your Influence</h2>
                    <p class="mt-2 text-lg text-neutral-gray">A seamless journey from idea to impact.</p>
                </div>
                <div class="grid md:grid-cols-3 gap-10 text-center">
                    <div class="p-8">
                        <div class="bg-flow-pink/10 text-flow-pink w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </div>
                        <h3 class="font-display text-2xl font-bold text-flow-blue">1. Tap the Current</h3>
                        <p class="mt-2 text-neutral-gray">Discover exclusive campaign opportunities from leading brands and tap into the flow of what's next.</p>
                    </div>
                    <div class="p-8">
                         <div class="bg-flow-blue/10 text-flow-blue w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                        <h3 class="font-display text-2xl font-bold text-flow-blue">2. Create Your Story</h3>
                        <p class="mt-2 text-neutral-gray">Share your authentic voice. Our platform makes it effortless to manage briefs, submit content, and collaborate.</p>
                    </div>
                    <div class="p-8">
                         <div class="bg-accent-green/10 text-accent-green w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        </div>
                        <h3 class="font-display text-2xl font-bold text-flow-blue">3. Make Waves</h3>
                        <p class="mt-2 text-neutral-gray">Track your impact in real-time. See how your influence creates waves and get rewarded for your success.</p>
                    </div>
                </div>
            </div>
        </section>
        
        <section id="advantage" class="py-20 bg-neutral-off-white">
            <div class="container mx-auto px-6">
                <div class="text-center mb-16">
                    <h2 class="font-display text-4xl font-bold text-flow-blue">The Unfair Advantage</h2>
                    <p class="mt-2 text-lg text-neutral-gray">Engineered for Brands. Built for Creators.</p>
                </div>
                <div class="grid md:grid-cols-2 gap-8">
                    <div class="bg-flow-blue text-white p-10 rounded-xl">
                         <h3 class="font-display text-3xl font-bold">For Brands</h3>
                         <p class="text-white/70 mt-2">The most direct channel to authentic influence in Indonesia.</p>
                         <ul class="mt-6 space-y-4">
                             <li class="flex items-start">
                                <svg class="w-6 h-6 text-accent-green mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                <span><strong>Market Intelligence:</strong> Access real-time data and the pulse of the creator economy to make smarter decisions.</span>
                            </li>
                            <li class="flex items-start">
                                <svg class="w-6 h-6 text-accent-green mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                <span><strong>Effortless Workflow:</strong> From creator discovery to campaign reporting, our platform streamlines every step.</span>
                            </li>
                             <li class="flex items-start">
                                <svg class="w-6 h-6 text-accent-green mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                <span><strong>Guaranteed Authenticity:</strong> Connect with a vetted community of creators committed to genuine storytelling.</span>
                            </li>
                         </ul>
                    </div>
                    <div class="bg-white p-10 rounded-xl border border-neutral-light-gray">
                        <h3 class="font-display text-3xl font-bold text-flow-pink">For Creators</h3>
                        <p class="text-neutral-gray mt-2">The platform that respects your craft and amplifies your voice.</p>
                        <ul class="mt-6 space-y-4">
                            <li class="flex items-start">
                                <svg class="w-6 h-6 text-flow-pink mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                <span><strong>Premium Opportunities:</strong> Get access to exclusive campaigns from world-class brands that value creativity.</span>
                            </li>
                            <li class="flex items-start">
                                <svg class="w-6 h-6 text-flow-pink mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                <span><strong>Creative Freedom:</strong> A streamlined process that gets out of your way so you can focus on what you do best: creating.</span>
                            </li>
                             <li class="flex items-start">
                                <svg class="w-6 h-6 text-flow-pink mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                <span><strong>Fair Rewards:</strong> Transparent and timely compensation for the value and impact you deliver.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section id="contact" class="bg-white">
            <div class="container mx-auto px-6 py-24">
                <div class="text-center p-12 sm:p-16 rounded-2xl relative overflow-hidden gradient-bg border border-neutral-light-gray">
                    <h2 class="font-display text-4xl sm:text-5xl font-extrabold text-flow-blue relative">Ready to Join the Current?</h2>
                    <p class="mt-4 max-w-xl mx-auto text-lg text-neutral-gray relative">Whether you're a brand ready to lead the market or a creator ready to make waves, your journey starts here.</p>
                    <div class="mt-8 relative flex flex-col sm:flex-row items-center justify-center gap-4">
                         <a href="#" class="bg-flow-pink text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-opacity-90 shadow-lg shadow-flow-pink/30 transition-transform hover:scale-105 w-full sm:w-auto">Join the Community</a>
                         <a href="#" class="bg-white text-flow-blue font-bold text-lg px-8 py-4 rounded-xl hover:bg-neutral-light-gray transition-colors border border-neutral-light-gray w-full sm:w-auto">Partner With Us</a>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="bg-flow-blue text-white">
        <div class="container mx-auto px-6 py-8 text-center">
            
            <p>&copy; 2025 Lixus Flow. All rights reserved.</p>
            <p class="text-sm text-white/60 mt-2">A product by 
                <a href="https://lixus.id" target="_blank" class="underline hover:text-flow-pink">Lixus.id</a>
                | <a href="/privacy-policy" target="_blank" class="underline hover:text-flow-pink">Privacy Policy</a>
                | <a href="/terms-of-service" target="_blank" class="underline hover:text-flow-pink">Terms of Service</a>
            </p>
        </div>
    </footer>
    <script>
        const canvas = document.getElementById('living-network-animation');
        const ctx = canvas.getContext('2d');

        // --- START: CUSTOMIZE YOUR ANIMATION HERE ---
        const config = {
            particleColor: 'rgba(255, 255, 255, 0.7)',
            lineColor: 'rgba(255, 0, 122, 0.3)', // Flow Pink with opacity
            particleAmount: 50,
            defaultSpeed: 0.5,
            variantSpeed: 0.5,
            defaultRadius: 2,
            variantRadius: 2,
            linkRadius: 200, // Max distance to draw a line
        };
        // --- END: CUSTOMIZATION ---

        let particles = [];

        function setCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.speed = config.defaultSpeed + Math.random() * config.variantSpeed;
                this.directionAngle = Math.floor(Math.random() * 360);
                this.color = config.particleColor;
                this.radius = config.defaultRadius + Math.random() * config.variantRadius;
                this.vector = {
                    x: Math.cos(this.directionAngle) * this.speed,
                    y: Math.sin(this.directionAngle) * this.speed
                };
            }

            update() {
                this.border();
                this.x += this.vector.x;
                this.y += this.vector.y;
            }

            border() {
                if (this.x >= canvas.width || this.x <= 0) {
                    this.vector.x *= -1;
                }
                if (this.y >= canvas.height || this.y <= 0) {
                    this.vector.y *= -1;
                }
                if (this.x > canvas.width) this.x = canvas.width;
                if (this.y > canvas.height) this.y = canvas.height;
                if (this.x < 0) this.x = 0;
                if (this.y < 0) this.y = 0;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        function createParticles() {
            particles = [];
            for (let i = 0; i < config.particleAmount; i++) {
                particles.push(new Particle());
            }
        }

        function linkParticles(point1, point2) {
            const distance = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
            if (distance < config.linkRadius) {
                const opacity = 1 - (distance / config.linkRadius);
                ctx.strokeStyle = `rgba(255, 0, 122, ${opacity})`; // Use Flow Pink from config, but dynamically set opacity
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(point1.x, point1.y);
                ctx.lineTo(point2.x, point2.y);
                ctx.closePath();
                ctx.stroke();
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    linkParticles(particles[i], particles[j]);
                }
            }

            requestAnimationFrame(animate);
        }

        // Initialize
        setCanvasSize();
        createParticles();
        animate();

        // Handle window resize
        window.addEventListener('resize', () => {
            setCanvasSize();
            createParticles();
        });

    </script>
</body>
</html>

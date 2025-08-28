<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lixus Flow - Find Your Community</title>

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
</head>
<body class="bg-neutral-off-white text-neutral-charcoal font-sans antialiased">

    <header class="bg-neutral-off-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-neutral-light-gray/60">
        <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
            <a href="lixus-flow-landing.html" class="flex items-center space-x-3">
                 <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 28V4H14" stroke="#0A2540" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M25 11.5C22.5 11.5 20.5 13 18 13C15.5 13 13.5 11.5 11 11.5" stroke="#FF007A" stroke-width="2.5" stroke-linecap="round"/>
                    <path d="M25 18.5C22.5 18.5 20.5 20 18 20C15.5 20 13.5 18.5 11 18.5" stroke="#0A2540" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
                <span class="font-display font-bold text-2xl text-flow-blue">Lixus Flow</span>
            </a>
            <a href="#" class="text-flow-blue font-semibold px-5 py-2 rounded-lg hover:bg-neutral-light-gray transition-colors">Brand Login</a>
        </nav>
    </header>

    <main>
        <section class="text-center py-20 sm:py-28">
            <div class="container mx-auto px-6">
                <h1 class="font-display text-5xl sm:text-6xl font-extrabold text-flow-blue leading-tight">
                    Choose Your Stage.
                </h1>
                <p class="mt-4 max-w-2xl mx-auto text-lg text-neutral-gray">
                    Lixus Flow is the gateway to exclusive creator communities from the world's leading brands. Select a community below to learn more and apply.
                </p>
            </div>
        </section>

        <section class="pb-20">
            <div class="container mx-auto px-6">
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    
                    <div class="bg-white rounded-2xl border border-neutral-light-gray/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                        <div class="p-8 flex-grow">
                            <img src="https://logo.clearbit.com/unilever.com" alt="Unilever Logo" class="h-10 mb-6">
                            <h2 class="font-display text-2xl font-bold text-flow-blue">The Unilever Creators Hub</h2>
                            <p class="mt-2 text-neutral-gray">Partner with iconic household names like Pepsodent, Sunsilk, and Bango. We're looking for storytellers who connect with the heart of Indonesian families.</p>
                        </div>
                        <div class="p-8 pt-0">
                            <a href="/influencer-application" class="bg-flow-blue text-white font-bold w-full py-3 rounded-lg hover:bg-opacity-90 transition block text-center">
                                Learn More & Apply
                            </a>
                        </div>
                    </div>

                    <div class="bg-white rounded-2xl border border-neutral-light-gray/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                        <div class="p-8 flex-grow">
                             <img src="https://logo.clearbit.com/reckitt.com" alt="Reckitt Logo" class="h-10 mb-6">
                            <h2 class="font-display text-2xl font-bold text-flow-blue">Reckitt Innovators Circle</h2>
                            <p class="mt-2 text-neutral-gray">Join forces with leading health and hygiene brands like Dettol and Harpic. Ideal for creators passionate about wellness, science, and a better future.</p>
                        </div>
                         <div class="p-8 pt-0">
                            <a href="#" class="bg-flow-blue text-white font-bold w-full py-3 rounded-lg hover:bg-opacity-90 transition block text-center">
                                Learn More & Apply
                            </a>
                        </div>
                    </div>

                    <div class="bg-white rounded-2xl border border-neutral-light-gray/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                        <div class="p-8 flex-grow">
                            <div class="h-10 mb-6 flex items-center">
                                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 28V4H14" stroke="#0A2540" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M25 11.5C22.5 11.5 20.5 13 18 13C15.5 13 13.5 11.5 11 11.5" stroke="#FF007A" stroke-width="2.5" stroke-linecap="round"></path>
                                    <path d="M25 18.5C22.5 18.5 20.5 20 18 20C15.5 20 13.5 18.5 11 18.5" stroke="#0A2540" stroke-width="2.5" stroke-linecap="round"></path>
                                </svg>
                                <span class="font-display font-bold text-xl text-flow-blue ml-2">Lixus Insiders</span>
                            </div>
                            <h2 class="font-display text-2xl font-bold text-flow-blue">The Lixus Insiders</h2>
                            <p class="mt-2 text-neutral-gray">For tech-savvy creators who want to be at the forefront of the creator economy. Test new features first and help shape the future of Lixus Flow.</p>
                        </div>
                         <div class="p-8 pt-0">
                            <a href="#" class="bg-flow-pink text-white font-bold w-full py-3 rounded-lg hover:bg-opacity-90 transition block text-center">
                                Learn More & Apply
                            </a>
                        </div>
                    </div>
                    
                    <div class="bg-neutral-off-white/80 rounded-2xl border-2 border-dashed border-neutral-light-gray flex flex-col items-center justify-center text-center p-8">
                        <h2 class="font-display text-2xl font-bold text-flow-blue">More Communities Coming Soon</h2>
                        <p class="mt-2 text-neutral-gray">We are partnering with more world-class brands every day. Stay tuned!</p>
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

</body>
</html>
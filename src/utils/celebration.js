import confetti from 'canvas-confetti'

export function triggerCelebration() {
    console.info("🎉 Triggering profitable trade celebration!");
    const duration = 2000; // 2 seconds
    const end = Date.now() + duration;
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    (function frame() {
        // Flower configuration: Launching from sides and top
        // Increased particleCount for better visibility
        confetti({
            particleCount: 15,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: colors,
            zIndex: 1000000
        });
        confetti({
            particleCount: 15,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: colors,
            zIndex: 1000000
        });
        confetti({
            particleCount: 15,
            angle: 270,
            spread: 90,
            origin: { x: 0.5, y: -0.1 },
            colors: colors,
            zIndex: 1000000
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}
document.querySelectorAll('.thumb[data-src]').forEach(el => {
            el.addEventListener('click', function () {

                document.querySelectorAll('.thumb').forEach(t => t.classList.remove('border-success', 'active'));


                const mainImage = document.getElementById('mainImage');
                mainImage.src = this.dataset.src;

                this.classList.add('border-success', 'active');
            });
        });


        const sizeButtons = document.querySelectorAll('.size-btn');
        const selectedSizeText = document.getElementById('selectedSize');
        sizeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedSizeText.textContent = btn.textContent;
            });
        });


        const colorButtons = document.querySelectorAll('[data-color]');
        const selectedColorText = document.getElementById('selectedColor');
        colorButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                colorButtons.forEach(b => b.classList.remove('ring-2', 'ring-[#007b5e]'));
                btn.classList.add('ring-2', 'ring-[#007b5e]');
                selectedColorText.textContent = btn.getAttribute('data-color');
            });
        });
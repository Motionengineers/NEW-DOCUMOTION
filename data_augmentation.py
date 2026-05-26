import random

class DataAugmentor:
    def augment(self, text):
        """Applies random transformations to simulate OCR noise."""
        lines = text.split('\n')
        augmented_lines = []
        
        for line in lines:
            if not line.strip():
                augmented_lines.append(line)
                continue
                
            # 10% chance to lowercase a line
            if random.random() < 0.1:
                line = line.lower()
            
            # 5% chance to swap a character (OCR error)
            if random.random() < 0.05 and len(line) > 5:
                idx = random.randint(0, len(line)-1)
                line = line[:idx] + random.choice('01I|OQ') + line[idx+1:]
                
            augmented_lines.append(line)
            
        return '\n'.join(augmented_lines)
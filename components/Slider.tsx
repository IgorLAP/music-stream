'use client'

import * as RadixSlider from '@radix-ui/react-slider'

interface SliderProps {
  value?: number;
  maxValue?: number;
  onChange?: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({
  value = 1,
  maxValue,
  onChange,
}) => {
  const handleChange = (newValue: number[]) => {
    onChange?.(newValue[0]);
  }

  return (
    <RadixSlider.Root
      className='
        relative
        flex
        items-center
        touch-none
        w-full
        group
      '
      defaultValue={[1]}
      value={[value]}
      onValueChange={handleChange}
      max={maxValue ?? 1}
      step={0.1}
      aria-label='Volume'
    >
      <RadixSlider.Track
        className='
          bg-neutral-600
          relative
          grow
          rounded-full
          h-[3px]
        '
      >
        <RadixSlider.Range
          className='
            transition
            absolute
            bg-white
            rounded-full
            h-full
          group-hover:bg-green-600
          '
        />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className='
          cursor-pointer
          transition
          hidden
          bg-transparent
          group-hover:block 
          group-hover:bg-white
          w-3 
          h-3 
          rounded-full 
        '
      />
    </RadixSlider.Root>
  );
}

export default Slider;
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "framer-motion";

const testimonials = [
  {
    text: "Sonna's Hotel delivers the most authentic Indian flavors! Their paneer dishes are incredible and delivery is always on time.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    name: "Priya Sharma",
    role: "Food Blogger",
  },
  {
    text: "Amazing food quality and the Korean buns are absolutely delicious! The app is so easy to use and ordering is seamless.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    name: "Rahul Kumar",
    role: "Regular Customer",
  },
  {
    text: "Best hotel for authentic Indian cuisine in the city. Their house specials are mind-blowing and service is exceptional.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b1c?w=150&h=150&fit=crop&crop=face",
    name: "Ananya Patel",
    role: "Local Resident",
  },
  {
    text: "The variety in their menu is outstanding! From pasta to biryani, everything is cooked to perfection. Highly recommend!",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    name: "Vikram Singh",
    role: "Chef & Critic",
  },
  {
    text: "Fast delivery, hot food, and amazing customer service. Sonna's Hotel has become our family's go-to for dinner.",
    image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
    name: "Sneha Reddy",
    role: "Family Customer",
  },
  {
    text: "Their Amritsari Chole and fresh naans are simply incredible. The authentic taste reminds me of home-cooked meals.",
    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face",
    name: "Arjun Mehta",
    role: "Food Enthusiast",
  },
  {
    text: "Ordered for our office party and everyone loved the food! Great portions, amazing flavors, and punctual delivery.",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
    name: "Kavya Joshi",
    role: "Office Manager",
  },
  {
    text: "The mobile app is super user-friendly and their customer support is top-notch. Food always arrives fresh and delicious.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f-1c?w=150&h=150&fit=crop&crop=face",
    name: "Amit Gupta",
    role: "Tech Professional",
  },
  {
    text: "Being a foodie, I've tried many places but Sonna's Hotel stands out for their consistent quality and diverse menu options.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    name: "Divya Agarwal",
    role: "Food Influencer",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const Testimonials = () => {
  return (
    <section className="my-20 relative overflow-hidden">
      <div className="container z-10 mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-center">
            What our customers say
          </h2>
            <p className="text-center mt-5 opacity-90 text-gradient bg-gradient-to-r from-orange-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent font-semibold">
            Discover why thousands of food lovers choose Sonna&apos;s Hotel for their dining experience.
            </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export { Testimonials };

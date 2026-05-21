"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { LampContainer } from "@/components/ui/lamp";

export function LampCTA() {
  return (
    <LampContainer>
      <motion.h3
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.4,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="bg-linear-to-br from-white to-brand-200 bg-clip-text text-center text-3xl md:text-5xl font-bold tracking-tight text-transparent leading-tight"
      >
        Topluluğa katılmaya
        <br />
        hazır mısın?
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.6,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-5 text-base md:text-lg text-brand-100/90 max-w-md mx-auto"
      >
        Ücretsiz kayıt ol, kuralları benimse, oyuna keyifle dön.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.8,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 flex flex-wrap gap-3 justify-center"
      >
        <Link href="/kayit">
          <Button
            size="lg"
            className="bg-white text-brand-700 hover:bg-brand-50 shine"
          >
            Kayıt Ol
            <ArrowRight size={18} weight="bold" />
          </Button>
        </Link>
        <Link href="/kurallar">
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            Önce kuralları oku
          </Button>
        </Link>
      </motion.div>
    </LampContainer>
  );
}

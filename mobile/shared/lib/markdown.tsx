import React from "react";
import { View, StyleSheet } from "react-native";
import Markdown from "react-native-marked";

import { bikerMapTheme } from "@package-shared/constants";

type Props = {
  content: string;
};

export function MarkdownContentNative({ content }: Props) {
  return (
    <View style={styles.container}>
      <Markdown
        value={content}
        styles={{
          h1: styles.h1,
          h2: styles.h2,
          h3: styles.h3,
          text: styles.text,
          paragraph: styles.p,
          list: styles.li,
          li: styles.li,
          link: styles.a,
          blockquote: styles.blockquote,
          code: styles.pre,
          image: styles.img,
        }}
        theme={{
          colors: {
            text: bikerMapTheme.colors.text,
            code: bikerMapTheme.colors.text,
            link: bikerMapTheme.colors.text,
            border: bikerMapTheme.colors.border,
          },
        }}
        flatListProps={{
          contentContainerStyle: { backgroundColor: bikerMapTheme.colors.bg },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  h1: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
  },
  h2: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
  },
  h3: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  text: {
    fontSize: 15,
  },
  p: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  li: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  a: {
    textDecorationLine: "underline",
  },
  blockquote: {
    borderLeftWidth: 2,
    borderLeftColor: "#E5572F66",
    paddingLeft: 8,
    fontStyle: "italic",
    color: "#6B7280",
    marginBottom: 8,
  },
  pre: {
    padding: 8,
    borderRadius: 12,
    fontFamily: "Courier",
    marginBottom: 8,
  },
  img: { width: "100%", height: 200, borderRadius: 12, marginBottom: 8 },
});
